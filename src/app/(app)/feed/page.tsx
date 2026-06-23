// @ts-nocheck
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/topbar";
import { VentureCard } from "@/components/venture-card";
import { EmptyState } from "@/components/empty-state";
import { FeedFilters } from "./feed-filters";

export const dynamic = "force-dynamic";

export default async function FeedPage({ searchParams }) {
  const { q, stage, domain, role } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("ventures")
    .select("*, owner:profiles!ventures_owner_id_fkey(full_name, department, role)")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(
      "title.ilike.%" + q + "%,one_liner.ilike.%" + q + "%,description.ilike.%" + q + "%"
    );
  }
  if (stage) query = query.eq("stage", stage);
  if (domain) query = query.eq("domain", domain);
  if (role) query = query.contains("roles_needed", [role]);

  const { data, error } = await query;
  const ventures = data ?? [];

  const hasFilters = !!(q || stage || domain || role);

  return (
    <div>
      <Topbar title="Feed" />
      <FeedFilters q={q} stage={stage} domain={domain} role={role} />

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
  );
}