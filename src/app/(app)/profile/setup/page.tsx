// @ts-nocheck
import { redirect } from "next/navigation";
import { ProfileForm } from "../profile-form";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export default async function ProfileSetupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/feed");

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">Your profile</h1>
      <p className="mt-2 text-ink-2">
        This is what other students see when they find your ventures.
      </p>
      <div className="mt-6 rounded-xl border border-line bg-white p-6">
        <ProfileForm profile={data ?? undefined} />
      </div>
    </div>
  );
}