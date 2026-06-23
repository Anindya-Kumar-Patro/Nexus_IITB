// @ts-nocheck
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/topbar";
import { Avatar } from "@/components/avatar";
import { VentureCard } from "@/components/venture-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { ApplicationActions } from "@/components/application-actions";
import { APPLICATION_STATUS_STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Pencil, Rocket, Send, Inbox, Bookmark,
  CheckCircle, Linkedin, Mail,
} from "lucide-react";
import type {
  ApplicationStatus,
  ApplicationWithApplicant,
  ApplicationWithVenture,
  Profile,
  VentureWithOwner,
} from "@/types/database";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "ventures", label: "My ventures" },
  { key: "applied", label: "Applied" },
  { key: "received", label: "Received" },
  { key: "saved", label: "Saved" },
];

function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", APPLICATION_STATUS_STYLES[status])}>
      {status}
    </span>
  );
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "ventures" } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/feed");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  const { count: ventureCount } = await supabase
    .from("ventures")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id);

  const { count: appliedCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("applicant_id", user.id);

  const { data: myVentureIds } = await supabase
    .from("ventures")
    .select("id")
    .eq("owner_id", user.id);

  const ids = (myVentureIds ?? []).map((v: { id: string }) => v.id);

  let receivedCount = 0;
  let acceptedCount = 0;
  if (ids.length > 0) {
    const { count: rc } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .in("venture_id", ids);
    receivedCount = rc ?? 0;
    const { count: ac } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .in("venture_id", ids)
      .eq("status", "accepted");
    acceptedCount = ac ?? 0;
  }

  const { count: savedCount } = await supabase
    .from("bookmarks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const fields = [
    profile?.full_name,
    profile?.roll_number,
    profile?.department,
    profile?.role,
    profile?.linkedin_url,
    profile?.skills?.length,
  ];
  const filled = fields.filter(Boolean).length;
  const completeness = Math.round((filled / fields.length) * 100);

  return (
    <div>
      <Topbar title="My profile" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">

        <div className="min-w-0">
          <div className="rounded-xl border border-line bg-white p-6">
            <div className="flex items-start gap-4">
              <Avatar name={profile?.full_name} size={64} />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-ink">{profile?.full_name}</h2>
                <p className="text-sm text-ink-3">
                  {profile?.department} · {profile?.role} · {profile?.roll_number}
                </p>
              </div>
              <Link href="/profile/setup">
                <Button variant="secondary">
                  <Pencil size={16} /> Edit
                </Button>
              </Link>
            </div>
            {profile?.skills && profile.skills.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {profile.skills.map((s: string) => (
                  <span key={s} className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-800">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mb-5 mt-8 flex gap-1 border-b border-line">
            {TABS.map((t) => (
              <Link
                key={t.key}
                href={"/profile?tab=" + t.key}
                className={cn(
                  "-mb-px border-b-2 px-4 py-2.5 text-sm transition",
                  tab === t.key
                    ? "border-brand-600 font-medium text-brand-800"
                    : "border-transparent text-ink-2 hover:text-ink",
                )}
              >
                {t.label}
              </Link>
            ))}
          </div>

          {tab === "ventures" && <MyVentures userId={user.id} />}
          {tab === "applied" && <Applied userId={user.id} />}
          {tab === "received" && <Received userId={user.id} />}
          {tab === "saved" && <Saved userId={user.id} />}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-line bg-white p-5">
            <p className="mb-4 text-sm font-semibold text-ink">Overview</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-brand-50 p-3 text-center">
                <Rocket size={18} className="mx-auto mb-1 text-brand-600" />
                <p className="text-2xl font-semibold text-ink">{ventureCount ?? 0}</p>
                <p className="text-xs text-ink-3">Ventures</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3 text-center">
                <CheckCircle size={18} className="mx-auto mb-1 text-emerald-600" />
                <p className="text-2xl font-semibold text-ink">{acceptedCount}</p>
                <p className="text-xs text-ink-3">Accepted</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 text-center">
                <Send size={18} className="mx-auto mb-1 text-amber-600" />
                <p className="text-2xl font-semibold text-ink">{appliedCount ?? 0}</p>
                <p className="text-xs text-ink-3">Applied</p>
              </div>
              <div className="rounded-lg bg-brand-50 p-3 text-center">
                <Inbox size={18} className="mx-auto mb-1 text-brand-600" />
                <p className="text-2xl font-semibold text-ink">{receivedCount}</p>
                <p className="text-xs text-ink-3">Received</p>
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-brand-50 p-3 text-center">
              <Bookmark size={18} className="mx-auto mb-1 text-brand-600" />
              <p className="text-2xl font-semibold text-ink">{savedCount ?? 0}</p>
              <p className="text-xs text-ink-3">Saved ventures</p>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">Profile strength</p>
              <span className="text-sm font-semibold text-brand-600">{completeness}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-brand-50">
              <div
                className="h-full rounded-full bg-brand-600 transition-all"
                style={{ width: completeness + "%" }}
              />
            </div>
            {completeness < 100 && (
              <p className="mt-2 text-xs text-ink-3">
                {completeness < 50
                  ? "Add your department, role and skills to stand out."
                  : "Add your LinkedIn URL to complete your profile."}
              </p>
            )}
            <Link href="/profile/setup" className="mt-3 block">
              <Button variant="secondary" className="w-full text-xs">
                <Pencil size={14} /> Edit profile
              </Button>
            </Link>
          </div>

          <div className="rounded-xl border border-line bg-white p-5">
            <p className="mb-3 text-sm font-semibold text-ink">Quick links</p>
            <div className="flex flex-col gap-2">
              {profile?.linkedin_url ? (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-ink-2 hover:bg-brand-50"
                >
                  <Linkedin size={16} /> LinkedIn profile
                </a>
              ) : (
                <Link
                  href="/profile/setup"
                  className="flex items-center gap-2 rounded-lg border border-dashed border-line px-3 py-2 text-sm text-ink-3 hover:bg-brand-50"
                >
                  <Linkedin size={16} /> Add LinkedIn URL
                </Link>
              )}
              <a
                href={"mailto:" + user.email}
                className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-ink-2 hover:bg-brand-50"
              >
                <Mail size={16} /> {user.email}
              </a>
              <Link
                href="/ventures/new"
                className="flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-400"
              >
                <Rocket size={16} /> Post a new venture
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

async function MyVentures({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ventures")
    .select("*, owner:profiles!ventures_owner_id_fkey(full_name, department, role)")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  const mine = (data ?? []) as unknown as VentureWithOwner[];
  if (mine.length === 0)
    return <EmptyState title="No ventures yet" hint="Share your first idea from the sidebar." />;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {mine.map((v) => <VentureCard key={v.id} venture={v} />)}
    </div>
  );
}

async function Saved({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookmarks")
    .select("venture:ventures(*, owner:profiles!ventures_owner_id_fkey(full_name, department, role))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  const saved = (data ?? [])
    .map((row: { venture: unknown }) => row.venture)
    .filter(Boolean) as unknown as VentureWithOwner[];
  if (saved.length === 0)
    return <EmptyState title="Nothing saved yet" hint="Tap Save on any venture to keep it here." />;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {saved.map((v) => <VentureCard key={v.id} venture={v} />)}
    </div>
  );
}

async function Applied({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("applications")
    .select("*, venture:ventures(id, title, one_liner, stage)")
    .eq("applicant_id", userId)
    .order("created_at", { ascending: false });
  const apps = (data ?? []) as unknown as ApplicationWithVenture[];
  if (apps.length === 0)
    return <EmptyState title="No applications yet" hint="Find a venture on the feed and tap Apply." />;
  return (
    <div className="flex flex-col gap-3">
      {apps.map((a) => (
        <div key={a.id} className="flex items-center gap-4 rounded-xl border border-line bg-white p-4">
          <div className="flex-1">
            <Link href={"/ventures/" + a.venture?.id} className="font-medium text-ink hover:text-brand-800">
              {a.venture?.title ?? "Venture removed"}
            </Link>
            <p className="text-sm text-ink-3">Applied as {a.role}</p>
          </div>
          <StatusBadge status={a.status} />
        </div>
      ))}
    </div>
  );
}

async function Received({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { data: ventureRows } = await supabase
    .from("ventures")
    .select("id")
    .eq("owner_id", userId);
  const ventureIds = (ventureRows ?? []).map((v: { id: string }) => v.id);
  if (ventureIds.length === 0)
    return <EmptyState title="No applications yet" hint="Once people apply to your ventures, they will show up here." />;
  const { data } = await supabase
    .from("applications")
    .select("*, applicant:profiles(*), venture:ventures(id, title)")
    .in("venture_id", ventureIds)
    .order("created_at", { ascending: false });
  const apps = (data ?? []) as unknown as ApplicationWithApplicant[];
  if (apps.length === 0)
    return <EmptyState title="No applications yet" hint="Once people apply to your ventures, they will show up here." />;
  return (
    <div className="flex flex-col gap-3">
      {apps.map((a) => (
        <div key={a.id} className="rounded-xl border border-line bg-white p-4">
          <div className="flex items-start gap-3">
            <Avatar name={a.applicant?.full_name} size={44} />
            <div className="flex-1">
              <p className="font-medium text-ink">{a.applicant?.full_name}</p>
              <p className="text-sm text-ink-3">
                {a.applicant?.department} · applying as {a.role} · for {a.venture?.title}
              </p>
              {a.message && <p className="mt-2 text-sm text-ink-2">{a.message}</p>}
              {a.applicant?.skills && a.applicant.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {a.applicant.skills.slice(0, 6).map((s: string) => (
                    <span key={s} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-800">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <StatusBadge status={a.status} />
          </div>
          {a.status === "pending" && (
            <div className="mt-4 border-t border-line pt-4">
              <ApplicationActions id={a.id} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
