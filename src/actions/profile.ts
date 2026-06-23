// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Department, UserRole } from "@/types/database";

export type ProfileState = { error?: string };

export async function saveProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const full_name = String(formData.get("full_name") ?? "").trim();
  const roll_number = String(formData.get("roll_number") ?? "").trim();
  const department = String(formData.get("department") ?? "") as Department;
  const role = String(formData.get("role") ?? "") as UserRole;
  const linkedin_url = String(formData.get("linkedin_url") ?? "").trim() || null;
  const skills = formData.getAll("skills").map(String);

  if (!full_name || !roll_number || !department || !role) {
    return { error: "Name, roll number, department and role are all required." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, roll_number, department, role, linkedin_url, skills })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  redirect("/feed");
}
