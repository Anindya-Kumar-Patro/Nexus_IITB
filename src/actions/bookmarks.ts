// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleBookmark(ventureId: string, currentlySaved: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (currentlySaved) {
    await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("venture_id", ventureId);
  } else {
    await supabase.from("bookmarks").insert({ user_id: user.id, venture_id: ventureId });
  }

  revalidatePath(`/ventures/${ventureId}`);
  revalidatePath("/profile");
}