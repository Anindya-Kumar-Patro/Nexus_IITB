// @ts-nocheck
"use client";

import { useRef, useEffect, useState, useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/avatar";
import { StageBadge } from "@/components/stage-badge";
import { APPLICATION_STATUS_STYLES } from "@/lib/constants";
import { cn, timeAgo } from "@/lib/utils";
import { sendMessage } from "@/actions/messages";
import { updateApplicationStatus } from "@/actions/applications";
import { togglePin, toggleBlock } from "@/actions/conversation-settings";
import {
  Send, Paperclip, ChevronDown, X, Check, XCircle,
  Linkedin, Mail, ArrowRight, ArrowLeft, Pin, PinOff,
  ShieldOff, Shield, FileText, File, Info,
} from "lucide-react";

function isSystemMessage(msg, index) { return index === 0; }

function getFileIcon(fileName) {
  if (!fileName) return <File size={14} />;
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (["pdf", "doc", "docx", "txt", "md"].includes(ext)) return <FileText size={14} />;
  return <File size={14} />;
}

function isImageFile(fileName) {
  if (!fileName) return false;
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
}

export function ChatLayout({
  tab, applications, selectedAppId, conversationId,
  messages: initialMessages, currentUser, isOwnerView, convSettings: initialSettings,
}) {
  const router = useRouter();
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const [mobileView, setMobileView] = useState(selectedAppId ? "chat" : "list");
  const [showProfile, setShowProfile] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [settings, setSettings] = useState(initialSettings ?? { pinned: false, blocked: false });
  const [unreadCounts, setUnreadCounts] = useState(
    Object.fromEntries(applications.map((a) => [a.id, a._unread_count]))
  );
  const [, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState(null);

  const selectedApp = applications.find((a) => a.id === selectedAppId) ?? null;
  const isReceived = (app) => !!app.applicant;

  useEffect(() => {
    setMessages(initialMessages);
    setSettings(initialSettings ?? { pinned: false, blocked: false });
    if (selectedAppId) {
      setUnreadCounts((prev) => ({ ...prev, [selectedAppId]: 0 }));
      setMobileView("chat");
    } else {
      setMobileView("list");
    }
  }, [conversationId, initialMessages, initialSettings, selectedAppId]);

  useEffect(() => {
    if (!conversationId) return;
    const supabase = createClient();
    const channel = supabase
      .channel("messages:" + conversationId)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: "conversation_id=eq." + conversationId },
        (payload) => {
          const newMsg = payload.new;
          setMessages((prev) => prev.find((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]);
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("unread-counts:" + currentUser.id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new;
          if (msg.sender_id === currentUser.id) return;
          const app = applications.find((a) => a._conv_id === msg.conversation_id);
          if (!app || app.id === selectedAppId) return;
          setUnreadCounts((prev) => ({ ...prev, [app.id]: (prev[app.id] ?? 0) + 1 }));
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [applications, currentUser.id, selectedAppId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  const boundSend = conversationId
    ? sendMessage.bind(null, conversationId)
    : async () => ({ error: "No conversation yet." });

  const [msgState, sendAction, sending] = useActionState(boundSend, {});

  const sortedApps = [...applications].sort((a, b) => {
    const aPinned = a.id === selectedAppId ? settings.pinned : false;
    const bPinned = b.id === selectedAppId ? settings.pinned : false;
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    const aUnread = unreadCounts[a.id] ?? 0;
    const bUnread = unreadCounts[b.id] ?? 0;
    if (aUnread > 0 && bUnread === 0) return -1;
    if (aUnread === 0 && bUnread > 0) return 1;
    const aTime = a._last_message_at ?? a.updated_at;
    const bTime = b._last_message_at ?? b.updated_at;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  const applicantProfile = selectedApp?.applicant ?? null;
  const ventureDetails = selectedApp?.venture ?? null;
  const linkBtnCls = "flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm text-ink-2 hover:bg-brand-50";
  const panelLinkCls = "flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-ink-2 hover:bg-brand-50";

  const ProfileContent = () => (
    <>
      {isReceived(selectedApp) && applicantProfile ? (
        <>
          <div className="flex flex-col items-center text-center">
            <Avatar name={applicantProfile.full_name} size={72} />
            <h3 className="mt-3 text-lg font-semibold text-ink">{applicantProfile.full_name}</h3>
            <p className="text-sm text-ink-3">{applicantProfile.department} · {applicantProfile.role ?.toLowerCase() === "both" ? "Founder & Builder" : applicantProfile.role}</p>
            <p className="text-xs text-ink-3">{applicantProfile.roll_number}</p>
          </div>
          {applicantProfile.skills && applicantProfile.skills.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-ink-3">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {applicantProfile.skills.map((s) => (
                  <span key={s} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-800">{s}</span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 flex flex-col gap-2">
            {applicantProfile.linkedin_url && (
              <a href={applicantProfile.linkedin_url} target="_blank" rel="noreferrer" className={panelLinkCls}>
                <Linkedin size={15} /> LinkedIn
              </a>
            )}
            <a href={"mailto:" + applicantProfile.email} className={panelLinkCls}>
              <Mail size={15} /> {applicantProfile.email}
            </a>
          </div>
        </>
      ) : ventureDetails ? (
        <>
          <h3 className="text-base font-semibold text-ink">{ventureDetails.title}</h3>
          <p className="mt-1 text-sm text-ink-2">{ventureDetails.one_liner}</p>
          <div className="mt-3"><StageBadge stage={ventureDetails.stage} /></div>
        </>
      ) : null}
    </>
  );

  const PendingContent = () => (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      {isReceived(selectedApp) && applicantProfile ? (
        <div className="mx-auto max-w-md">
          <div className="rounded-xl border border-line bg-white p-5">
            <div className="flex flex-col items-center text-center">
              <Avatar name={applicantProfile.full_name} size={64} />
              <h2 className="mt-3 text-xl font-semibold text-ink">{applicantProfile.full_name}</h2>
              <p className="text-sm text-ink-3">{applicantProfile.department} · {applicantProfile.role ?.toLowerCase() === "both" ? "Founder & Builder" : applicantProfile.role}</p>
              <p className="text-xs text-ink-3">{applicantProfile.roll_number}</p>
            </div>
            {applicantProfile.skills && applicantProfile.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {applicantProfile.skills.map((s) => (
                  <span key={s} className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-800">{s}</span>
                ))}
              </div>
            )}
            {selectedApp.message && (
              <div className="mt-4 rounded-lg bg-brand-50 p-4">
                <p className="mb-1 text-xs font-medium text-ink-3">Why they are a fit</p>
                <p className="text-sm text-ink">{selectedApp.message}</p>
              </div>
            )}
            <div className="mt-4 flex justify-center gap-3">
              {applicantProfile.linkedin_url && (
                <a href={applicantProfile.linkedin_url} target="_blank" rel="noreferrer" className={linkBtnCls}>
                  <Linkedin size={15} /> LinkedIn
                </a>
              )}
              <a href={"mailto:" + applicantProfile.email} className={linkBtnCls}>
                <Mail size={15} /> Email
              </a>
            </div>
            {selectedApp.status === "pending" && (
              <div className="mt-5 flex gap-3 border-t border-line pt-4">
                <button
                  onClick={() => startTransition(() => updateApplicationStatus(selectedApp.id, "accepted").then(() => router.refresh()))}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-400"
                >
                  <Check size={16} /> Accept
                </button>
                <button
                  onClick={() => startTransition(() => updateApplicationStatus(selectedApp.id, "rejected").then(() => router.refresh()))}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-line py-2.5 text-sm font-medium text-ink-2 hover:bg-brand-50"
                >
                  <XCircle size={16} /> Reject
                </button>
              </div>
            )}
            {selectedApp.status === "rejected" && (
              <div className="mt-4 flex justify-center">
                <span className="rounded-full bg-red-50 px-4 py-1.5 text-sm font-medium text-red-700">Application rejected</span>
              </div>
            )}
          </div>
        </div>
      ) : ventureDetails ? (
        <div className="mx-auto max-w-md">
          <div className="rounded-xl border border-line bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-ink">{ventureDetails.title}</h2>
                <p className="mt-1 text-sm text-ink-2">{ventureDetails.one_liner}</p>
              </div>
              <StageBadge stage={ventureDetails.stage} />
            </div>
            <div className="mt-4 rounded-lg bg-brand-50 p-4">
              <p className="mb-1 text-xs font-medium text-ink-3">Your application</p>
              <p className="text-sm text-ink">Applied as <span className="font-medium">{selectedApp.role}</span></p>
              {selectedApp.message && <p className="mt-2 text-sm text-ink-2">{selectedApp.message}</p>}
            </div>
            <div className="mt-4 flex justify-center">
              <span className={cn("rounded-full px-4 py-1.5 text-sm font-medium", APPLICATION_STATUS_STYLES[selectedApp.status])}>
                {selectedApp.status === "pending" ? "Waiting for response" : selectedApp.status}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="flex h-full" id="chat-root">

      {/* Mobile profile full screen */}
      {mobileView === "profile" && selectedApp && (
        <div className="flex flex-1 flex-col lg:hidden">
          <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-3">
            <button onClick={() => setMobileView("chat")}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-3">
              <ArrowLeft size={16} />
            </button>
            <p className="text-sm font-semibold text-ink">
              {isReceived(selectedApp) ? applicantProfile?.full_name : ventureDetails?.title}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <ProfileContent />
          </div>
        </div>
      )}

      {/* Pane 2 - list */}
      <div className={cn(
        "flex flex-col border-r border-line bg-white",
        "w-full lg:w-72 lg:shrink-0 lg:flex",
        mobileView === "list" ? "flex" : "hidden lg:flex"
      )}>
        {/* Tab switcher - Applied / Received */}
        <div className="flex border-b border-line">
          <button
            onClick={() => router.push("/messages?tab=applied")}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition border-b-2",
              tab === "applied"
                ? "border-brand-600 text-brand-800"
                : "border-transparent text-ink-3 hover:text-ink"
            )}
          >
            Applied
          </button>
          <button
            onClick={() => router.push("/messages?tab=received")}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition border-b-2",
              tab === "received"
                ? "border-brand-600 text-brand-800"
                : "border-transparent text-ink-3 hover:text-ink"
            )}
          >
            Received
          </button>
        </div>

        <div className="border-b border-line px-4 py-2">
          <p className="text-xs text-ink-3">{applications.length} application{applications.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sortedApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <p className="text-sm text-ink-3">No applications yet</p>
            </div>
          ) : sortedApps.map((app) => {
            const name = isReceived(app) ? app.applicant?.full_name : app.venture?.title;
            const ventureName = isReceived(app) ? app.venture?.title : null;
            const isSelected = app.id === selectedAppId;
            const isPinned = isSelected && settings.pinned;
            const unread = unreadCounts[app.id] ?? 0;
            return (
              <button key={app.id}
                onClick={() => {
                  router.push("/messages?tab=" + tab + "&app=" + app.id);
                  setMobileView("chat");
                }}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition",
                  isSelected ? "bg-brand-50" : "hover:bg-brand-50/50",
                  unread > 0 && !isSelected && "bg-brand-50/30"
                )}
              >
                <div className="relative shrink-0">
                  <Avatar name={name} size={40} />
                  {isPinned && (
                    <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-white">
                      <Pin size={9} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate text-sm text-ink", unread > 0 ? "font-semibold" : "font-medium")}>{name ?? "Unknown"}</p>
                  {ventureName && <p className="truncate text-xs font-medium text-brand-600">{ventureName}</p>}
                  <p className="truncate text-xs text-ink-3">{app.role} · {app.status}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {app._last_message_at && <p className="text-[10px] text-ink-3">{timeAgo(app._last_message_at)}</p>}
                  {unread > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pane 3 - chat */}
      <div className={cn(
        "flex flex-1 flex-col overflow-hidden",
        mobileView === "chat" ? "flex" : "hidden lg:flex",
        mobileView === "profile" && "hidden"
      )}>
        {!selectedApp ? (
          <div className="hidden lg:flex flex-1 items-center justify-center bg-brand-50/30">
            <div className="text-center">
              <p className="text-lg font-medium text-ink-2">Select an application</p>
              <p className="mt-1 text-sm text-ink-3">Choose from the list to view details or chat</p>
            </div>
          </div>
        ) : (
          <>
            {/* topbar */}
            <div className="flex shrink-0 items-center gap-2 border-b border-line bg-white px-3 py-3">
              <button
                onClick={() => { setMobileView("list"); router.push("/messages?tab=" + tab); }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ink-3 lg:hidden"
              >
                <ArrowLeft size={16} />
              </button>

              <button
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth < 1024) {
                    setMobileView("profile");
                  } else {
                    setShowProfile(!showProfile);
                  }
                }}
                className="flex flex-1 min-w-0 items-center gap-2"
              >
                <Avatar name={isReceived(selectedApp) ? applicantProfile?.full_name : ventureDetails?.title} size={34} />
                <div className="min-w-0 text-left">
                  <p className="truncate text-sm font-semibold text-ink">
                    {isReceived(selectedApp) ? applicantProfile?.full_name : ventureDetails?.title}
                  </p>
                  <p className="truncate text-xs text-ink-3">
                    {isReceived(selectedApp)
                      ? (ventureDetails?.title ?? "") + " · " + (selectedApp.role ?.toLowerCase() === "both" ? "Founder & Builder" : selectedApp.role)
                      : "Applied as " + selectedApp.role}
                  </p>
                </div>
                <ArrowRight size={14} className="shrink-0 text-ink-3" />
              </button>

              <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-medium", APPLICATION_STATUS_STYLES[selectedApp.status])}>
                {selectedApp.status}
              </span>

              {selectedApp.status === "accepted" && conversationId && (
                <>
                  <button
                    onClick={() => startTransition(async () => { await togglePin(conversationId, settings.pinned); setSettings((s) => ({ ...s, pinned: !s.pinned })); })}
                    className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-3 hover:bg-brand-50"
                  >
                    {settings.pinned ? <PinOff size={15} /> : <Pin size={15} />}
                  </button>
                  <button
                    onClick={() => startTransition(async () => { await toggleBlock(conversationId, settings.blocked); setSettings((s) => ({ ...s, blocked: !s.blocked })); })}
                    className={cn("hidden sm:flex h-8 w-8 items-center justify-center rounded-full border border-line hover:bg-brand-50", settings.blocked ? "text-red-500" : "text-ink-3")}
                  >
                    {settings.blocked ? <Shield size={15} /> : <ShieldOff size={15} />}
                  </button>
                </>
              )}

              {showProfile && (
                <button onClick={() => setShowProfile(false)} className="hidden lg:flex text-ink-3 hover:text-ink">
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="flex flex-1 overflow-hidden min-h-0">
              <div className="flex flex-1 flex-col min-h-0">
                {settings.blocked ? (
                  <div className="flex flex-1 items-center justify-center">
                    <div className="text-center">
                      <Shield size={32} className="mx-auto mb-3 text-ink-3" />
                      <p className="text-sm font-medium text-ink-2">This conversation is blocked</p>
                      <button
                        onClick={() => startTransition(async () => { await toggleBlock(conversationId, settings.blocked); setSettings((s) => ({ ...s, blocked: false })); })}
                        className="mt-3 rounded-full border border-line px-4 py-2 text-sm text-ink-2 hover:bg-brand-50"
                      >Unblock</button>
                    </div>
                  </div>
                ) : selectedApp.status === "accepted" && conversationId ? (
                  <>
                    {/* messages - scrollable */}
                    <div className="flex-1 overflow-y-auto px-3 py-4 min-h-0">
                      <div className="flex flex-col gap-2">
                        {messages.length === 0 && (
                          <p className="py-8 text-center text-sm text-ink-3">No messages yet. Say hello!</p>
                        )}
                        {messages.map((msg, index) => {
                          const isMe = msg.sender_id === currentUser.id;
                          if (isSystemMessage(msg, index)) {
                            return (
                              <div key={msg.id} className="flex justify-center py-1">
                                <div className="flex max-w-[90%] items-start gap-2 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-xs text-ink-2">
                                  <Info size={12} className="mt-0.5 shrink-0 text-brand-600" />
                                  <p className="leading-relaxed">{msg.body}</p>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                              <div className={cn(
                                "max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                                isMe
                                  ? "rounded-tr-sm bg-brand-600 text-white"
                                  : "rounded-tl-sm border border-line bg-white text-ink"
                              )}>
                                {msg.body && <p>{msg.body}</p>}
                                {msg.file_url && (
                                  isImageFile(msg.file_name) ? (
                                    <a href={msg.file_url} target="_blank" rel="noreferrer">
                                      <img src={msg.file_url} alt={msg.file_name ?? "image"} className="mt-1.5 max-h-40 rounded-lg object-cover" />
                                    </a>
                                  ) : (
                                    <a href={msg.file_url} target="_blank" rel="noreferrer"
                                      className={cn("mt-1.5 flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs",
                                        isMe ? "border-white/20 bg-white/10 text-white" : "border-line bg-brand-50 text-brand-800"
                                      )}>
                                      {getFileIcon(msg.file_name)}
                                      <span className="truncate">{msg.file_name ?? "File"}</span>
                                    </a>
                                  )
                                )}
                                <p className={cn("mt-0.5 text-right text-[10px]", isMe ? "text-white/60" : "text-ink-3")}>
                                  {timeAgo(msg.created_at)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={bottomRef} />
                      </div>
                      {messages.length > 5 && (
                        <button onClick={scrollToBottom}
                          className="sticky bottom-2 float-right flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-ink-2 shadow-sm hover:bg-brand-50">
                          <ChevronDown size={16} />
                        </button>
                      )}
                    </div>

                    {/* input - fixed at bottom */}
                    <div className="shrink-0 border-t border-line bg-white px-3 py-2">
                      {selectedFile && (
                        <div className="mb-2 flex w-full items-center gap-2 rounded-lg border border-line bg-brand-50 px-3 py-1.5 overflow-hidden">
                          {getFileIcon(selectedFile.name)}
                          <span className="min-w-0 flex-1 truncate text-xs text-ink">{selectedFile.name}</span>
                          <span className="text-xs text-ink-3">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</span>
                          <button onClick={() => setSelectedFile(null)} className="text-ink-3"><X size={13} /></button>
                        </div>
                      )}
                      <form action={async (fd) => { if (selectedFile) fd.set("file", selectedFile); await sendAction(fd); setSelectedFile(null); }}
                        className="flex items-center gap-2">
                        <div className="flex flex-1 items-center gap-2 rounded-full border border-line bg-white px-4 py-2">
                          <input name="body" placeholder="Type a message..." className="flex-1 bg-transparent text-sm outline-none" autoComplete="off" />
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="shrink-0 text-ink-3 hover:text-brand-600">
                            <Paperclip size={17} />
                          </button>
                          <input ref={fileInputRef} type="file" className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              if (f.size > 26214400) { alert("File must be under 25 MB"); return; }
                              setSelectedFile(f);
                            }} />
                        </div>
                        <button type="submit" disabled={sending}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white disabled:opacity-50">
                          <Send size={15} />
                        </button>
                      </form>
                      {msgState.error && <p className="mt-1 text-xs text-red-500">{msgState.error}</p>}
                    </div>
                  </>
                ) : <PendingContent />}
              </div>

              {/* Pane 4 - desktop only */}
              {showProfile && selectedApp.status === "accepted" && (
                <div className="hidden lg:flex w-72 shrink-0 flex-col overflow-y-auto border-l border-line bg-white px-5 py-6">
                  <ProfileContent />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}