// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { VentureStage } from "@/types/database";

export type VentureState = { error?: string };

function parse(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    one_liner: String(formData.get("one_liner") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    stage: String(formData.get("stage") ?? "Brainstorming") as VentureStage,
    domain: String(formData.get("domain") ?? "").trim() || null,
    roles_needed: formData.getAll("roles_needed").map(String),
  };
}

export async function createVenture(_prev: VentureState, formData: FormData): Promise<VentureState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const v = parse(formData);
  if (!v.title || !v.one_liner || !v.description) {
    return { error: "Title, one-liner and description are required." };
  }
  if (v.one_liner.length > 60) {
    return { error: "Keep the one-liner under 60 characters." };
  }

  const { error } = await supabase.from("ventures").insert({ ...v, owner_id: user.id });
  if (error) return { error: error.message };

  revalidatePath("/feed");
  redirect("/feed");
}

export async function updateVenture(
  id: string,
  _prev: VentureState,
  formData: FormData,
): Promise<VentureState> {
  const supabase = await createClient();
  const v = parse(formData);
  if (!v.title || !v.one_liner || !v.description) {
    return { error: "Title, one-liner and description are required." };
  }

  // RLS guarantees only the owner can update; no extra check needed.
  const { error } = await supabase.from("ventures").update(v).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/feed");
  revalidatePath(`/ventures/${id}`);
  redirect(`/ventures/${id}`);
}

export async function deleteVenture(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("ventures").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/feed");
  redirect("/feed");
}
