import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatLayout } from "./chat-layout";
import type { Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; app?: string }>;
}) {
  const { tab = "applied", app: selectedAppId } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/feed");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  // Applied = applications where I am the applicant
  // Received = applications where I am the venture owner
  // This is determined by who the current user is, not the tab name

  let applications: any[] = [];

  if (tab === "applied") {
    const { data } = await supabase
      .from("applications")
      .select("*, venture:ventures(id, title, one_liner, stage, owner_id, roles_needed, description, domain)")
      .eq("applicant_id", user.id)
      .order("updated_at", { ascending: false });
    applications = data ?? [];
  } else {
    // received: get all ventures I own, then get applications to those ventures
    const { data: myVentures } = await supabase
      .from("ventures")
      .select("id")
      .eq("owner_id", user.id);
    const ventureIds = (myVentures ?? []).map((v: { id: string }) => v.id);

    if (ventureIds.length > 0) {
      const { data } = await supabase
        .from("applications")
        .select("*, applicant:profiles(*), venture:ventures(id, title, one_liner, stage)")
        .in("venture_id", ventureIds)
        .order("updated_at", { ascending: false });
      applications = data ?? [];
    }
  }

  // For each application, get unread message count and last message time
  // so we can sort and show badges
  const appIds = applications.map((a: any) => a.id);

  // get conversation ids for these applications
  let convMap: Record<string, { id: string; last_message_at: string | null }> = {};
  let unreadMap: Record<string, number> = {};

  if (appIds.length > 0) {
    const { data: convs } = await supabase
      .from("conversations")
      .select("id, application_id")
      .in("application_id", appIds);

    const convIds = (convs ?? []).map((c: any) => c.id);
    convMap = Object.fromEntries(
      (convs ?? []).map((c: any) => [c.application_id, { id: c.id, last_message_at: null }])
    );

    if (convIds.length > 0) {
      // get last message time per conversation
      const { data: lastMsgs } = await supabase
        .from("messages")
        .select("conversation_id, created_at")
        .in("conversation_id", convIds)
        .order("created_at", { ascending: false });

      const lastMsgMap: Record<string, string> = {};
      for (const msg of lastMsgs ?? []) {
        if (!lastMsgMap[msg.conversation_id]) {
          lastMsgMap[msg.conversation_id] = msg.created_at;
        }
      }

      // update convMap with last message times
      for (const appId of Object.keys(convMap)) {
        const convId = convMap[appId].id;
        convMap[appId].last_message_at = lastMsgMap[convId] ?? null;
      }

      // get unread counts per conversation for current user
      const { data: unreadMsgs } = await supabase
        .from("messages")
        .select("conversation_id")
        .in("conversation_id", convIds)
        .eq("read", false)
        .neq("sender_id", user.id);

      for (const msg of unreadMsgs ?? []) {
        unreadMap[msg.conversation_id] = (unreadMap[msg.conversation_id] ?? 0) + 1;
      }
    }
  }

  // attach unread count + last message time to each application
  const appsWithMeta = applications.map((a: any) => {
    const conv = convMap[a.id];
    return {
      ...a,
      _conv_id: conv?.id ?? null,
      _last_message_at: conv?.last_message_at ?? null,
      _unread_count: conv ? (unreadMap[conv.id] ?? 0) : 0,
    };
  });

  // sort: unread first, then by last message time desc, then by updated_at desc
  appsWithMeta.sort((a: any, b: any) => {
    if (a._unread_count > 0 && b._unread_count === 0) return -1;
    if (a._unread_count === 0 && b._unread_count > 0) return 1;
    const aTime = a._last_message_at ?? a.updated_at;
    const bTime = b._last_message_at ?? b.updated_at;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  // fetch conversation + messages for selected app
  let conversationId: string | null = null;
  let messages: any[] = [];
  let convSettings: { pinned: boolean; blocked: boolean } | null = null;

  if (selectedAppId) {
    const { data: conv } = await supabase
      .from("conversations")
      .select("id")
      .eq("application_id", selectedAppId)
      .maybeSingle();

    if (conv) {
      conversationId = conv.id;

      const { data: msgs } = await supabase
        .from("messages")
        .select("id, sender_id, body, file_url, file_name, created_at, read")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: true });
      messages = msgs ?? [];

      // mark messages as read
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("conversation_id", conv.id)
        .neq("sender_id", user.id)
        .eq("read", false);

      // mark related notifications as read
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("conversation_id", conv.id)
        .eq("read", false);

      const { data: settings } = await supabase
        .from("conversation_settings")
        .select("pinned, blocked")
        .eq("user_id", user.id)
        .eq("conversation_id", conv.id)
        .maybeSingle();
      convSettings = settings ?? { pinned: false, blocked: false };
    } else {
      // no conversation yet (pending/rejected) - mark application notifications read
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("application_id", selectedAppId)
        .eq("read", false);
    }
  }

  return (
    <ChatLayout
      tab={tab}
      applications={appsWithMeta}
      selectedAppId={selectedAppId ?? null}
      conversationId={conversationId}
      messages={messages}
      currentUser={profile!}
      isOwnerView={tab === "received"}
      convSettings={convSettings}
    />
  );
}
