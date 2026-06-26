// @ts-nocheck
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StageBadge } from "@/components/stage-badge";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { DeleteVentureButton } from "@/components/delete-venture-button";
import { ApplyButton } from "@/components/apply-button";
import { SaveButton } from "@/components/save-button";
import {
  Mail, Linkedin, Pencil, ArrowLeft, Users,
  Calendar, Rocket, ChevronRight,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: venture } = await supabase
    .from("ventures")
    .select("title, one_liner, description")
    .eq("id", id)
    .single();

  if (!venture) return { title: "Nexus IITB" };

  return {
    title: venture.title + " · Nexus IITB",
    description: venture.one_liner ?? venture.description?.slice(0, 150) ?? "A venture on Nexus IITB",
    openGraph: {
      title: venture.title + " · Nexus IITB",
      description: venture.one_liner ?? venture.description?.slice(0, 150) ?? "",
      siteName: "Nexus IITB",
    },
  };
}



export default async function VentureDetail({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: venture } = await supabase
    .from("ventures")
    .select("*")
    .eq("id", id)
    .single();
  if (!venture) notFound();

  const { data: owner } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", venture.owner_id)
    .single();

  const isOwner = user?.id === venture.owner_id;

  let existingStatus = null;
  let saved = false;
  let applicantCount = 0;

  if (user && !isOwner) {
    const { data: app } = await supabase
      .from("applications")
      .select("status")
      .eq("venture_id", id)
      .eq("applicant_id", user.id)
      .maybeSingle();
    existingStatus = app?.status ?? null;

    const { data: bm } = await supabase
      .from("bookmarks")
      .select("venture_id")
      .eq("venture_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    saved = !!bm;
  }

  if (isOwner) {
    const { count } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("venture_id", id);
    applicantCount = count ?? 0;
  }

  // similar ventures — same domain, not this one
  const { data: similar } = await supabase
    .from("ventures")
    .select("*, owner:profiles!ventures_owner_id_fkey(full_name, department)")
    .eq("domain", venture.domain)
    .neq("id", id)
    .limit(3);

  const similarVentures = similar ?? [];

  const iconBtn = "flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-2 hover:bg-brand-50";

  return (
    <div>
      <Link
        href="/feed"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink"
      >
        <ArrowLeft size={16} /> Back to feed
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">

        {/* left — venture detail */}
        <div className="rounded-xl border border-line bg-white p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-ink">{venture.title}</h1>
              <p className="mt-1 text-ink-2">{venture.one_liner}</p>
            </div>
            <StageBadge stage={venture.stage} />
          </div>

          {venture.domain && (
            <span className="mt-4 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-800">
              {venture.domain}
            </span>
          )}

          <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-ink">
            {venture.description}
          </p>

          {venture.roles_needed && venture.roles_needed.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-ink-2">Looking for</p>
              <div className="flex flex-wrap gap-2">
                {venture.roles_needed.map((r) => (
                  <span
                    key={r}
                    className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs text-brand-800"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7 border-t border-line pt-6">
            {isOwner ? (
              <div className="flex flex-wrap items-center gap-3">
                <Link href={"/ventures/" + venture.id + "/edit"}>
                  <Button variant="secondary">
                    <Pencil size={16} /> Edit
                  </Button>
                </Link>
                <DeleteVentureButton id={venture.id} />
                <Link href="/profile?tab=received" className="ml-auto">
                  <Button variant="ghost">
                    <Users size={16} />
                    {applicantCount} applicant{applicantCount === 1 ? "" : "s"}
                  </Button>
                </Link>
              </div>
            ) : user ? (
              <div className="flex flex-wrap items-center gap-3">
                <ApplyButton
                  ventureId={venture.id}
                  roles={venture.roles_needed ?? []}
                  isAuthed={!!user}
                  existingStatus={existingStatus}
                />
                <SaveButton
                  ventureId={venture.id}
                  initialSaved={saved}
                  isAuthed={!!user}
                />
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-4 rounded-xl border border-brand-100 bg-brand-50 px-5 py-4">
                <p className="flex-1 text-sm text-ink-2">Sign in with your IITB email to apply for this venture.</p>
                <Link href="/feed?signin=1" className="rounded-full bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-400">
                  Sign in to apply
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* right panel */}
        <div className="flex flex-col gap-4">

          {/* founder card */}
          <div className="rounded-xl border border-line bg-white p-5">
            <p className="mb-4 text-sm font-semibold text-ink">
              {isOwner ? "Your venture" : "About the founder"}
            </p>
            <div className="flex items-center gap-3">
              <Avatar name={owner?.full_name} size={48} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{owner?.full_name}</p>
                <p className="text-sm text-ink-3">
                  {owner?.department} · {owner?.role}
                </p>
              </div>
            </div>

            {owner?.skills && owner.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {owner.skills.slice(0, 6).map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-800"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <a
                href={"mailto:" + owner?.email}
                aria-label="Email founder"
                className={iconBtn}
              >
                <Mail size={18} />
              </a>
              {owner?.linkedin_url && (
                <a
                  href={owner.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className={iconBtn}
                >
                  <Linkedin size={18} />
                </a>
              )}
            </div>
          </div>

          {/* venture stats */}
          <div className="rounded-xl border border-line bg-white p-5">
            <p className="mb-4 text-sm font-semibold text-ink">Venture stats</p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Rocket size={15} />
                </div>
                <div>
                  <p className="text-xs text-ink-3">Stage</p>
                  <p className="font-medium text-ink">{venture.stage}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Users size={15} />
                </div>
                <div>
                  <p className="text-xs text-ink-3">Applications</p>
                  <p className="font-medium text-ink">
                    {isOwner ? applicantCount : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Calendar size={15} />
                </div>
                <div>
                  <p className="text-xs text-ink-3">Posted</p>
                  <p className="font-medium text-ink">{timeAgo(venture.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* similar ventures */}
          {similarVentures.length > 0 && (
            <div className="rounded-xl border border-line bg-white p-5">
              <p className="mb-4 text-sm font-semibold text-ink">
                Similar in {venture.domain}
              </p>
              <div className="flex flex-col gap-1">
                {similarVentures.map((v) => (
                  <Link
                    key={v.id}
                    href={"/ventures/" + v.id}
                    className="group flex items-center gap-3 rounded-lg p-2 hover:bg-brand-50"
                  >
                    <Avatar name={v.title} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink group-hover:text-brand-800">
                        {v.title}
                      </p>
                      <p className="truncate text-xs text-ink-3">{v.one_liner}</p>
                    </div>
                    <ChevronRight size={15} className="shrink-0 text-ink-3" />
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}