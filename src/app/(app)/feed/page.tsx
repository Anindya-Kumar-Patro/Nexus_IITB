import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/topbar";
import { VentureCard } from "@/components/venture-card";
import { EmptyState } from "@/components/empty-state";
import type { VentureWithOwner } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ventures")
    .select("*, owner:profiles!ventures_owner_id_fkey(full_name, department, role)")
    .order("created_at", { ascending: false });

  const ventures = (data ?? []) as unknown as VentureWithOwner[];

  return (
    <div>
      <Topbar title="Feed" />

      {error ? (
        <EmptyState title="Couldn't load the feed" hint="Refresh the page to try again." />
      ) : ventures.length === 0 ? (
        <EmptyState
          title="No ventures yet"
          hint='Be the first — tap "Post a venture" to share your idea.'
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