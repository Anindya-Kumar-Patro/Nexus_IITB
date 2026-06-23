"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ApplicationStatus } from "@/types/database";

export type ApplyState = { error?: string; ok?: boolean };

export async function applyToVenture(
  ventureId: string,
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to apply." };

  const role = String(formData.get("role") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!role) return { error: "Pick a role to apply for." };
  if (!message) return { error: "Please tell the founder why you are a good fit." };

  const { error } = await supabase
    .from("applications")
    .insert({ venture_id: ventureId, applicant_id: user.id, role, message });

  if (error) {
    if (error.code === "23505") return { error: "You have already applied to this venture." };
    return { error: error.message };
  }

  revalidatePath("/ventures/" + ventureId);
  revalidatePath("/profile");
  return { ok: true };
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("applications").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/profile");
  revalidatePath("/messages");
}
