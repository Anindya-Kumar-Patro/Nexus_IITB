import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StageBadge } from "@/components/stage-badge";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { DeleteVentureButton } from "@/components/delete-venture-button";
import { ApplyButton } from "@/components/apply-button";
import { SaveButton } from "@/components/save-button";
import { Mail, Linkedin, Pencil, ArrowLeft, Users } from "lucide-react";
import type { ApplicationStatus, Profile, Venture } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function VentureDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: venture } = await supabase
    .from("ventures")
    .select("*")
    .eq("id", id)
    .single();
  if (!venture) notFound();
  const v = venture as Venture;

  const { data: owner } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", v.owner_id)
    .single<Profile>();

  const isOwner = user?.id === v.owner_id;

  let existingStatus: ApplicationStatus | null = null;
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

  const btnClass = "flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-2 hover:bg-brand-50";

  return (
    <div className="max-w-2xl">
      <Link
        href="/feed"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink"
      >
        <ArrowLeft size={16} /> Back to feed
      </Link>

      <div className="rounded-xl border border-line bg-white p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-ink">{v.title}</h1>
            <p className="mt-1 text-ink-2">{v.one_liner}</p>
          </div>
          <StageBadge stage={v.stage} />
        </div>

        {v.domain && (
          <span className="mt-4 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-800">
            {v.domain}
          </span>
        )}

        <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-ink">
          {v.description}
        </p>

        {v.roles_needed.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-ink-2">Looking for</p>
            <div className="flex flex-wrap gap-2">
              {v.roles_needed.map((r) => (
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
              <Link href={`/ventures/${v.id}/edit`}>
                <Button variant="secondary">
                  <Pencil size={16} /> Edit
                </Button>
              </Link>
              <DeleteVentureButton id={v.id} />
              <Link href="/profile?tab=received" className="ml-auto">
                <Button variant="ghost">
                  <Users size={16} />
                  {applicantCount} applicant{applicantCount === 1 ? "" : "s"}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <ApplyButton
                  ventureId={v.id}
                  roles={v.roles_needed}
                  isAuthed={!!user}
                  existingStatus={existingStatus}
                />
                <SaveButton
                  ventureId={v.id}
                  initialSaved={saved}
                  isAuthed={!!user}
                />
              </div>
              <div className="flex items-center gap-3">
                <Avatar name={owner?.full_name} size={44} />
                <div className="flex-1">
                  <p className="font-medium text-ink">{owner?.full_name}</p>
                  <p className="text-sm text-ink-3">
                    {owner?.department} · {owner?.role}
                  </p>
                </div>
                <a href={`mailto:${owner?.email}`} aria-label="Email founder" className={btnClass}>
                  <Mail size={18} />
                </a>
                {owner?.linkedin_url && (
                  <a href={owner.linkedin_url} target="_blank" rel="noreferrer" aria-label="LinkedIn" className={btnClass}>
                    <Linkedin size={18} />
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
