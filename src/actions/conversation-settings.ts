"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function togglePin(conversationId: string, currentlyPinned: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("conversation_settings")
    .upsert({
      user_id: user.id,
      conversation_id: conversationId,
      pinned: !currentlyPinned,
    }, { onConflict: "user_id,conversation_id" });

  revalidatePath("/messages");
}

export async function toggleBlock(conversationId: string, currentlyBlocked: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("conversation_settings")
    .upsert({
      user_id: user.id,
      conversation_id: conversationId,
      blocked: !currentlyBlocked,
    }, { onConflict: "user_id,conversation_id" });

  revalidatePath("/messages");
}
