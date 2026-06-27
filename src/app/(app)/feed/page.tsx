// @ts-nocheck
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Footer } from "@/components/footer";
import { Topbar } from "@/components/topbar";
import { VentureCard } from "@/components/venture-card";
import { EmptyState } from "@/components/empty-state";
import { FeedFilters } from "./feed-filters";
import { ArrowRight, Rocket } from "lucide-react";

export const dynamic = "force-dynamic";

const DOMAIN_COLORS = {
  "FinTech":       { bg: "bg-violet-100", text: "text-violet-700", icon: "💰" },
  "EdTech":        { bg: "bg-emerald-100", text: "text-emerald-700", icon: "📚" },
  "HealthTech":    { bg: "bg-red-100", text: "text-red-700", icon: "🏥" },
  "DeepTech":      { bg: "bg-blue-100", text: "text-blue-700", icon: "🔬" },
  "SaaS":          { bg: "bg-amber-100", text: "text-amber-700", icon: "☁️" },
  "Hardware":      { bg: "bg-orange-100", text: "text-orange-700", icon: "⚙️" },
  "Consumer":      { bg: "bg-pink-100", text: "text-pink-700", icon: "🛍️" },
  "Sustainability":{ bg: "bg-green-100", text: "text-green-700", icon: "🌱" },
  "AI / ML":       { bg: "bg-indigo-100", text: "text-indigo-700", icon: "🤖" },
  "Other":         { bg: "bg-gray-100", text: "text-gray-700", icon: "✨" },
};

export default async function FeedPage({ searchParams }) {
  const { q, stage, domain, role } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const hasFilters = !!(q || stage || domain || role);

  // filtered ventures query
  let query = supabase
    .from("ventures")
    .select("*, owner:profiles!ventures_owner_id_fkey(full_name, department, role)")
    .order("created_at", { ascending: false });

  let ownerIds = [];
  if (q) {
    const { data: matchingProfiles } = await supabase
      .from("profiles")
      .select("id")
      .ilike("full_name", "%" + q + "%");
    ownerIds = (matchingProfiles ?? []).map((p) => p.id);
  }

  if (q) {
    if (ownerIds.length > 0) {
      query = query.or(
        "title.ilike.%" + q + "%,one_liner.ilike.%" + q + "%,description.ilike.%" + q + "%,owner_id.in.(" + ownerIds.join(",") + ")"
      );
    } else {
      query = query.or(
        "title.ilike.%" + q + "%,one_liner.ilike.%" + q + "%,description.ilike.%" + q + "%"
      );
    }
  }
  if (stage) query = query.eq("stage", stage);
  if (domain) query = query.eq("domain", domain);
  if (role) query = query.contains("roles_needed", [role]);

  const { data, error } = await query;
  const ventures = data ?? [];

  // domain counts (for cards) — only when not filtering
  let domainCounts = {};
  if (!hasFilters) {
    const { data: allVentures } = await supabase
      .from("ventures")
      .select("domain");
    for (const v of allVentures ?? []) {
      if (v.domain) domainCounts[v.domain] = (domainCounts[v.domain] ?? 0) + 1;
    }
  }

  // new this week
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const newThisWeek = !hasFilters
    ? ventures.filter((v) => v.created_at >= weekAgo)
    : [];

  const domainsWithVentures = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 120px)" }}>
      <div className="flex-1">
      <Topbar title="Feed" />

      {/* hero — only show when not filtering */}
      {!hasFilters && (
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-brand-600 p-8">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="mb-2 text-sm font-medium text-white/70 uppercase tracking-wider">
                Nexus · IIT Bombay
              </p>
              <h2 className="text-3xl font-semibold leading-tight text-white">
                Find your<br />co-founder on campus
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
                Post your idea, list the roles you need, and connect with builders across IITB.
              </p>
              <div className="mt-5 flex gap-3">
                {user ? (
                  <Link
                    href="/ventures/new"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-50"
                  >
                    <Rocket size={16} /> Post a venture
                  </Link>
                ) : (
                  <Link
                    href="/feed"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-50"
                  >
                    Explore ventures <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </div>
            <div className="hidden lg:flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-6xl">
              💡
            </div>
          </div>
        </div>
      )}

      <FeedFilters q={q} stage={stage} domain={domain} role={role} />

      {/* domain cards — only when not filtering */}
      {!hasFilters && domainsWithVentures.length > 0 && (
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink">Browse by domain</h3>
            <span className="text-xs text-ink-3">{domainsWithVentures.length} domains</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {domainsWithVentures.map(([d, count]) => {
              const style = DOMAIN_COLORS[d] ?? DOMAIN_COLORS["Other"];
              return (
                <Link
                  key={d}
                  href={"/feed?domain=" + encodeURIComponent(d)}
                  className="group flex items-center gap-3 rounded-xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-100"
                >
                  <div className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl " + style.bg}>
                    {style.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{d}</p>
                    <p className="text-xs text-ink-3">{count} venture{count !== 1 ? "s" : ""}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* new this week */}
      {!hasFilters && newThisWeek.length > 0 && (
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <h3 className="text-base font-semibold text-ink">New this week</h3>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-700">
              {newThisWeek.length} new
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {newThisWeek.slice(0, 4).map((v) => (
              <VentureCard key={v.id} venture={v} />
            ))}
          </div>
        </div>
      )}

      {/* all ventures */}
      {!hasFilters && ventures.length > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-base font-semibold text-ink">All ventures</h3>
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-600">
            {ventures.length}
          </span>
        </div>
      )}

      {error ? (
        <EmptyState title="Could not load the feed" hint="Refresh the page to try again." />
      ) : ventures.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No ventures match your filters" : "No ventures yet"}
          hint={hasFilters ? "Try clearing some filters." : "Be the first to post a venture."}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {ventures.map((v) => (
            <VentureCard key={v.id} venture={v} />
          ))}
        </div>
      )}
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}