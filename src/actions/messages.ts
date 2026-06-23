"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type MessageState = { error?: string };

export async function sendMessage(
  conversationId: string,
  _prev: MessageState,
  formData: FormData,
): Promise<MessageState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const body = String(formData.get("body") ?? "").trim();
  const file = formData.get("file") as File | null;

  if (!body && (!file || file.size === 0)) {
    return { error: "Message is empty." };
  }

  let file_url: string | null = null;
  let file_name: string | null = null;

  if (file && file.size > 0) {
    if (file.size > 26214400) {
      return { error: "File must be under 25 MB." };
    }

    const ext = file.name.split(".").pop() ?? "bin";
    const path = conversationId + "/" + user.id + "-" + Date.now() + "." + ext;

    const { error: uploadError } = await supabase.storage
      .from("chat-files")
      .upload(path, file, { upsert: false });

    if (uploadError) return { error: uploadError.message };

    const { data: urlData } = supabase.storage
      .from("chat-files")
      .getPublicUrl(path);

    file_url = urlData?.publicUrl ?? null;
    file_name = file.name;
  }

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body: body || null,
    file_url,
    file_name,
  });

  if (error) return { error: error.message };
  revalidatePath("/messages");
  return {};
}

export async function markMessagesRead(conversationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("messages")
    .update({ read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id);
}

export async function markNotificationRead(id: string) {
  const supabase = await createClient();
  await supabase.from("notifications").update({ read: true }).eq("id", id);
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);
}
