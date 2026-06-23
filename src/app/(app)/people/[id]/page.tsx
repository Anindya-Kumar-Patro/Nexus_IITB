// @ts-nocheck
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/topbar";
import { Avatar } from "@/components/avatar";
import { VentureCard } from "@/components/venture-card";
import { EmptyState } from "@/components/empty-state";
import { StageBadge } from "@/components/stage-badge";
import { ArrowLeft, Mail, Linkedin, Rocket } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const { data: ventures } = await supabase
    .from("ventures")
    .select("*, owner:profiles!ventures_owner_id_fkey(full_name, department, role)")
    .eq("owner_id", id)
    .order("created_at", { ascending: false });

  const isOwnProfile = user?.id === id;

  return (
    <div className="max-w-3xl">
      <Topbar title="Profile" />

      <Link
        href="/people"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink"
      >
        <ArrowLeft size={16} /> Back to people
      </Link>

      {/* profile card */}
      <div className="rounded-xl border border-line bg-white p-6">
        <div className="flex items-start gap-5">
          <Avatar name={profile.full_name} size={72} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-ink">{profile.full_name}</h1>
                <p className="mt-1 text-sm text-ink-3">
                  {profile.department}
                  {profile.roll_number ? " · " + profile.roll_number : ""}
                </p>
              </div>
              {isOwnProfile && (
                <Link
                  href="/profile/setup"
                  className="shrink-0 rounded-full border border-line px-4 py-2 text-sm text-ink-2 hover:bg-brand-50"
                >
                  Edit profile
                </Link>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {profile.role && (
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800">
                  {profile.role}
                </span>
              )}
              {profile.account_type && profile.account_type !== "student" && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  {profile.account_type}
                </span>
              )}
            </div>
          </div>
        </div>

        {profile.skills && profile.skills.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium text-ink-3">Skills</p>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-800"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* contact */}
        {!isOwnProfile && user && (
          <div className="mt-5 flex gap-2 border-t border-line pt-5">
            <a
              href={"mailto:" + profile.email}
              className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink-2 hover:bg-brand-50"
            >
              <Mail size={16} /> Email
            </a>
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink-2 hover:bg-brand-50"
              >
                <Linkedin size={16} /> LinkedIn
              </a>
            )}
          </div>
        )}
      </div>

      {/* ventures */}
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Rocket size={18} className="text-brand-600" />
          <h2 className="text-lg font-semibold text-ink">
            {isOwnProfile ? "My ventures" : profile.full_name + "'s ventures"}
          </h2>
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-600">
            {(ventures ?? []).length}
          </span>
        </div>

        {!ventures || ventures.length === 0 ? (
          <EmptyState
            title="No ventures posted yet"
            hint={isOwnProfile ? "Share your first idea from the sidebar." : ""}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {ventures.map((v) => (
              <VentureCard key={v.id} venture={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}