"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, MessageCircle, UserCheck, UserX, Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { markNotificationRead, markAllNotificationsRead } from "@/actions/messages";
import { cn, timeAgo } from "@/lib/utils";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  conversation_id: string | null;
  application_id: string | null;
  created_at: string;
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  new_application: <Inbox size={16} className="text-brand-600" />,
  application_accepted: <UserCheck size={16} className="text-emerald-600" />,
  application_rejected: <UserX size={16} className="text-red-500" />,
  new_message: <MessageCircle size={16} className="text-brand-600" />,
};

export function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => setNotifications((data ?? []) as Notification[]));

    const channel = supabase
      .channel("notifications:" + userId)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: "user_id=eq." + userId,
      }, (payload) => {
        setNotifications((prev) => [payload.new as Notification, ...prev].slice(0, 10));
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "notifications",
        filter: "user_id=eq." + userId,
      }, (payload) => {
        setNotifications((prev) =>
          prev.map((n) => n.id === payload.new.id ? payload.new as Notification : n)
        );
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = async (n: Notification) => {
    if (!n.read) await markNotificationRead(n.id);
    setOpen(false);
    if (n.conversation_id) {
      router.push("/messages?tab=received&conv=" + n.conversation_id);
    } else if (n.application_id) {
      const tab = n.type === "new_application" ? "received" : "applied";
      router.push("/messages?tab=" + tab + "&app=" + n.application_id);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink-2 hover:bg-brand-50"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-line bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-semibold text-ink">Notifications</p>
            {unread > 0 && (
              <button
                onClick={async () => {
                  await markAllNotificationsRead();
                  setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                }}
                className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800"
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-ink-3">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left transition hover:bg-brand-50",
                    !n.read && "bg-brand-50/60"
                  )}
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50">
                    {TYPE_ICON[n.type] ?? <Bell size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm", !n.read && "font-medium text-ink")}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="mt-0.5 truncate text-xs text-ink-3">{n.body}</p>
                    )}
                    <p className="mt-1 text-[10px] text-ink-3">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.read && (
                    <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
