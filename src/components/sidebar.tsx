// @ts-nocheck
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Users, UserCircle, Plus, LogOut, LogIn, Send, Inbox } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { signOut } from "@/actions/auth";
import { AuthModal } from "@/components/auth-modal";
import { createClient } from "@/lib/supabase/client";

export function Sidebar({
  name,
  isAuthed,
  userId,
}: {
  name: string | null;
  isAuthed: boolean;
  userId?: string;
}) {
  const path = usePathname();
  const searchParams = useSearchParams();
  const [authOpen, setAuthOpen] = useState(false);
  const [receivedDot, setReceivedDot] = useState(false);
  const [appliedDot, setAppliedDot] = useState(false);

  const isMessagesTab = (tab: string) =>
    path === "/messages" && searchParams.get("tab") === tab;

  const navCls = (active: boolean) =>
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
      // Received dot: new applications (owner side) + messages where I am the owner
      const { count: rc } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false)
        .or("type.eq.new_application,and(type.eq.new_message,conv_role.eq.owner)");

      // Applied dot: accepted/rejected status + messages where I am the applicant
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

  // clear dots when visiting the tab
  useEffect(() => {
    if (!userId || path !== "/messages") return;
    const tab = searchParams.get("tab");
    const supabase = createClient();

    if (tab === "received") {
      supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false)
        .or("type.eq.new_application,and(type.eq.new_message,conv_role.eq.owner)")
        .then(() => setReceivedDot(false));
    }
    if (tab === "applied") {
      supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false)
        .or("type.eq.application_accepted,type.eq.application_rejected,and(type.eq.new_message,conv_role.eq.applicant)")
        .then(() => setAppliedDot(false));
    }
  }, [path, searchParams, userId]);

  return (
    <>
      <aside className="flex w-60 shrink-0 flex-col bg-sidebar p-5">
        <div className="px-1.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-lg font-semibold text-white">
            {isAuthed ? initials(name) : "N"}
          </div>
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
          <Link href="/feed" className={navCls(path === "/feed")}>
            <Home size={19} /> Feed
          </Link>
          <Link href="/people" className={navCls(path === "/people")}>
            <Users size={19} /> People
          </Link>
          {isAuthed && (
            <Link href="/profile" className={navCls(path === "/profile")}>
              <UserCircle size={19} /> My profile
            </Link>
          )}
        </nav>

        {isAuthed && (
          <>
            <p className="mb-2 mt-6 px-2 text-[11px] uppercase tracking-wider text-white/40">Applications</p>
            <nav className="flex flex-col gap-1">
              <Link href="/messages?tab=applied" className={navCls(isMessagesTab("applied"))}>
                <Send size={19} />
                <span className="flex-1">Applied</span>
                {appliedDot && <span className="h-2 w-2 rounded-full bg-red-500" />}
              </Link>
              <Link href="/messages?tab=received" className={navCls(isMessagesTab("received"))}>
                <Inbox size={19} />
                <span className="flex-1">Received</span>
                {receivedDot && <span className="h-2 w-2 rounded-full bg-red-500" />}
              </Link>
            </nav>
          </>
        )}

        <div className="mt-auto flex flex-col gap-2">
          {isAuthed ? (
            <>
              <Link
                href="/ventures/new"
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
                onClick={() => setAuthOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-medium text-white transition hover:bg-brand-400"
              >
                <Plus size={18} /> Post a venture
              </button>
              <button
                onClick={() => setAuthOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm text-white/70 transition hover:text-white"
              >
                <LogIn size={16} /> Sign in / Sign up
              </button>
            </>
          )}
        </div>
      </aside>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
