// @ts-nocheck
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/topbar";
import { Avatar } from "@/components/avatar";
import { VentureCard } from "@/components/venture-card";
import { EmptyState } from "@/components/empty-state";
import { ArrowLeft, Mail, Linkedin, Rocket, Building2, Users } from "lucide-react";

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

  const ventureList = ventures ?? [];
  const isOwnProfile = user?.id === id;

  // count accepted applications received (as owner)
  const { count: acceptedCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .in("venture_id", ventureList.map((v) => v.id))
    .eq("status", "accepted");

  return (
    <div>
      <Topbar title="Profile" />

      <Link
        href="/people"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink"
      >
        <ArrowLeft size={16} /> Back to people
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">

        {/* left column */}
        <div>
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
                    <span key={s} className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-800">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
                {ventureList.length}
              </span>
            </div>

            {ventureList.length === 0 ? (
              <EmptyState
                title="No ventures posted yet"
                hint={isOwnProfile ? "Share your first idea from the sidebar." : ""}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {ventureList.map((v) => (
                  <VentureCard key={v.id} venture={v} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* right panel */}
        <div className="flex flex-col gap-4">

          {/* stats */}
          <div className="rounded-xl border border-line bg-white p-5">
            <p className="mb-4 text-sm font-semibold text-ink">Overview</p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Rocket size={16} />
                </div>
                <div>
                  <p className="text-xs text-ink-3">Ventures posted</p>
                  <p className="text-lg font-semibold text-ink">{ventureList.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Users size={16} />
                </div>
                <div>
                  <p className="text-xs text-ink-3">Team members accepted</p>
                  <p className="text-lg font-semibold text-ink">{acceptedCount ?? 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Building2 size={16} />
                </div>
                <div>
                  <p className="text-xs text-ink-3">Department</p>
                  <p className="text-sm font-medium text-ink">{profile.department ?? "—"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* contact card — shown to logged in users viewing someone else */}
          {!isOwnProfile && user && (
            <div className="rounded-xl border border-line bg-white p-5">
              <p className="mb-3 text-sm font-semibold text-ink">Get in touch</p>
              <div className="flex flex-col gap-2">
                <a
                  href={"mailto:" + profile.email}
                  className="flex items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-sm text-ink-2 hover:bg-brand-50"
                >
                  <Mail size={15} /> {profile.email}
                </a>
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-sm text-ink-2 hover:bg-brand-50"
                  >
                    <Linkedin size={15} /> LinkedIn profile
                  </a>
                )}
              </div>
            </div>
          )}

          {/* domains active in */}
          {ventureList.length > 0 && (
            <div className="rounded-xl border border-line bg-white p-5">
              <p className="mb-3 text-sm font-semibold text-ink">Active in</p>
              <div className="flex flex-wrap gap-2">
                {[...new Set(ventureList.map((v) => v.domain).filter(Boolean))].map((d) => (
                  <Link
                    key={d}
                    href={"/feed?domain=" + d}
                    className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-800 hover:bg-brand-100"
                  >
                    {d}
                  </Link>
                ))}
                {ventureList.every((v) => !v.domain) && (
                  <p className="text-xs text-ink-3">No domains set</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}