// @ts-nocheck
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Users, UserCircle, Plus, LogOut, LogIn, Send, Inbox, Menu, X } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { signOut } from "@/actions/auth";
import { AuthModal } from "@/components/auth-modal";
import { createClient } from "@/lib/supabase/client";

export function Sidebar({ name, isAuthed, userId }) {
  const path = usePathname();
  const searchParams = useSearchParams();
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [receivedDot, setReceivedDot] = useState(false);
  const [appliedDot, setAppliedDot] = useState(false);

  const isMessagesTab = (tab) =>
    path === "/messages" && searchParams.get("tab") === tab;

  const navCls = (active) =>
    cn(
      "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition",
      active
        ? "bg-white/15 font-medium text-white"
        : "text-white/60 hover:bg-white/5 hover:text-white"
    );

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();

    const fetchDots = async () => {
      const { count: rc } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false)
        .or("type.eq.new_application,and(type.eq.new_message,conv_role.eq.owner)");

      const { count: ac } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false)
        .or("type.eq.application_accepted,type.eq.application_rejected,and(type.eq.new_message,conv_role.eq.applicant)");

      setReceivedDot((rc ?? 0) > 0);
      setAppliedDot((ac ?? 0) > 0);
    };

    fetchDots();

    const channel = supabase
      .channel("sidebar-dots:" + userId)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: "user_id=eq." + userId,
      }, () => fetchDots())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  useEffect(() => {
    if (!userId || path !== "/messages") return;
    const tab = searchParams.get("tab");
    const supabase = createClient();

    if (tab === "received") {
      supabase.from("notifications").update({ read: true })
        .eq("user_id", userId).eq("read", false)
        .or("type.eq.new_application,and(type.eq.new_message,conv_role.eq.owner)")
        .then(() => setReceivedDot(false));
    }
    if (tab === "applied") {
      supabase.from("notifications").update({ read: true })
        .eq("user_id", userId).eq("read", false)
        .or("type.eq.application_accepted,type.eq.application_rejected,and(type.eq.new_message,conv_role.eq.applicant)")
        .then(() => setAppliedDot(false));
    }
  }, [path, searchParams, userId]);

  // close mobile menu on navigation
  useEffect(() => { setMobileOpen(false); }, [path, searchParams]);

  const SidebarContent = ({ variant = "desktop" }) => (
    <div className="flex flex-1 flex-col">
      <div className="px-1.5">
        <img src="/nexus-logo.png" alt="Nexus" className="h-12 w-12 rounded-xl object-cover" />
        {isAuthed ? (
          <>
            <p className="mt-3 text-xs text-white/50">Hi!</p>
            <p className="text-lg font-semibold leading-tight text-white">{name ?? "Welcome"}</p>
          </>
        ) : (
          <>
            <p className="mt-3 text-lg font-semibold leading-tight text-white">Nexus IITB</p>
            <p className="text-xs text-white/50">Browsing as a guest</p>
          </>
        )}
      </div>

      <p className="mb-2 mt-7 px-2 text-[11px] uppercase tracking-wider text-white/40">Menu</p>
      <nav className="flex flex-col gap-1">
        <Link href="/feed" className={navCls(path === "/feed")} onClick={() => setMobileOpen(false)}>
          <Home size={19} /> Feed
        </Link>
        <Link href="/people" className={navCls(path.startsWith("/people"))} onClick={() => setMobileOpen(false)}>
          <Users size={19} /> People
        </Link>
        {isAuthed && (
          <Link href="/profile" className={navCls(path === "/profile")} onClick={() => setMobileOpen(false)}>
            <UserCircle size={19} /> My profile
          </Link>
        )}
      </nav>

      {isAuthed && (
        <>
          <p className="mb-2 mt-6 px-2 text-[11px] uppercase tracking-wider text-white/40">Applications</p>
          <nav className="flex flex-col gap-1">
            <Link href="/messages?tab=applied" className={navCls(isMessagesTab("applied"))} onClick={() => setMobileOpen(false)}>
              <Send size={19} />
              <span className="flex-1">Applied</span>
              {appliedDot && <span className="h-2 w-2 rounded-full bg-red-500" />}
            </Link>
            <Link href="/messages?tab=received" className={navCls(isMessagesTab("received"))} onClick={() => setMobileOpen(false)}>
              <Inbox size={19} />
              <span className="flex-1">Received</span>
              {receivedDot && <span className="h-2 w-2 rounded-full bg-red-500" />}
            </Link>
          </nav>
        </>
      )}

      <div className={cn("flex flex-col gap-2", variant === "desktop" ? "mt-auto" : "mt-auto pb-2")}>
        {isAuthed ? (
          <>
            <Link
              href="/ventures/new"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-medium text-white transition hover:bg-brand-400"
            >
              <Plus size={18} /> Post a venture
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm text-white/50 transition hover:text-white"
              >
                <LogOut size={16} /> Sign out
              </button>
            </form>
          </>
        ) : (
          <>
            <button
              onClick={() => { setMobileOpen(false); setAuthOpen(true); }}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-medium text-white transition hover:bg-brand-400"
            >
              <Plus size={18} /> Post a venture
            </button>
            <button
              onClick={() => { setMobileOpen(false); setAuthOpen(true); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm text-white/70 transition hover:text-white"
            >
              <LogIn size={16} /> Sign in / Sign up
            </button>
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-sidebar p-5 h-screen sticky top-0 overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between bg-sidebar px-4 lg:hidden">
        <a href="/feed" className="flex items-center gap-2">
          <img src="/nexus-logo.png" alt="Nexus" className="h-8 w-8 rounded-lg object-cover" />
          <span className="text-sm font-semibold text-white">Nexus IITB</span>
        </a>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile slide-out menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 flex w-72 flex-col bg-sidebar p-5 overflow-y-auto">
            <div className="mb-4 flex shrink-0 items-center justify-between">
              <span className="text-sm font-semibold text-white">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="text-white/60 hover:text-white">
                <X size={20} />
              </button>
            </div>
<SidebarContent variant="mobile" />
          </aside>
        </div>
      )}

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-white/10 bg-sidebar px-2 lg:hidden">
        <Link href="/feed" className={cn("flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition", path === "/feed" ? "text-white" : "text-white/50")}>
          <Home size={20} />
          <span className="text-[10px]">Feed</span>
        </Link>
        <Link href="/people" className={cn("flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition", path.startsWith("/people") ? "text-white" : "text-white/50")}>
          <Users size={20} />
          <span className="text-[10px]">People</span>
        </Link>
        {isAuthed && (
          <Link href="/ventures/new" className="flex flex-col items-center gap-1 px-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white">
              <Plus size={20} />
            </div>
          </Link>
        )}
        {isAuthed ? (
          <>
            <Link href="/messages" className={cn("relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition", path === "/messages" ? "text-white" : "text-white/50")}>
              <Send size={20} />
              <span className="text-[10px]">Messages</span>
              {(appliedDot || receivedDot) && (
                <span className="absolute right-2 top-1 h-2 w-2 rounded-full bg-red-500" />
              )}
            </Link>
            <Link href="/profile" className={cn("flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition", path === "/profile" ? "text-white" : "text-white/50")}>
              <UserCircle size={20} />
              <span className="text-[10px]">Profile</span>
            </Link>
          </>
        ) : (
          <button
            onClick={() => setAuthOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-2 text-white/50"
          >
            <LogIn size={20} />
            <span className="text-[10px]">Sign in</span>
          </button>
        )}
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}