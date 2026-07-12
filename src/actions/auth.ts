// @ts-nocheck
"use server";
import { createClient } from "@/lib/supabase/server";
import { isIitbEmail } from "@/lib/utils";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export type AuthState = { error?: string; sent?: boolean; switchToSignIn?: boolean };

function friendlySignInError(msg: string): string {
  if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials"))
    return "Wrong email or password. Please try again.";
  if (msg.includes("Email not confirmed"))
    return "Please verify your email first. Check your IITB inbox for the confirmation link.";
  if (msg.includes("Too many requests"))
    return "Too many attempts. Please wait a few minutes and try again.";
  return msg;
}

function friendlySignUpError(msg: string): string {
  if (msg.includes("User already registered") || msg.includes("already been registered"))
    return "ALREADY_REGISTERED";
  if (msg.includes("Password should be at least"))
    return "Password must be at least 6 characters.";
  if (msg.includes("Unable to validate email"))
    return "Please enter a valid email address.";
  if (msg.includes("Too many requests"))
    return "Too many attempts. Please wait a few minutes and try again.";
  return msg;
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: friendlySignInError(error.message) };
  revalidatePath("/", "layout");
  redirect("/feed");
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const full_name = String(formData.get("full_name") ?? "").trim();
  const account_type = String(formData.get("account_type") ?? "student");
  const roll_number = String(formData.get("roll_number") ?? "").trim();
  const department = String(formData.get("department") ?? "");
  const role = String(formData.get("role") ?? "");
  const linkedin_url = String(formData.get("linkedin_url") ?? "").trim() || null;
  const skills = formData.getAll("skills").map(String);

  if (account_type !== "investor" && !isIitbEmail(email)) {
    return { error: "Please use your @iitb.ac.in email address." };
  }
  if (password.length < 6) return { error: "Password must be at least 6 characters." };
  if (!full_name || !roll_number || !department || !role) {
    return { error: "Name, roll number, department and role are all required." };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
      data: { full_name, roll_number, department, role, account_type, skills, linkedin_url },
    },
  });

  if (error) {
    const friendly = friendlySignUpError(error.message);
    if (friendly === "ALREADY_REGISTERED") return { error: "ALREADY_REGISTERED" };
    return { error: friendly };
  }
  if (!data.session) return { sent: true };
  revalidatePath("/", "layout");
  redirect("/feed");
}


export async function resetPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Please enter your email address." };

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset`,
  });

  if (error) return { error: "Could not send reset email. Please try again." };
  return { sent: true };
}

export async function updatePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Could not update password. Please try again." };
  revalidatePath("/", "layout");
  redirect("/feed");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/feed");
}
