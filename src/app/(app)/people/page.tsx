// @ts-nocheck
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/topbar";
import { Avatar } from "@/components/avatar";
import { EmptyState } from "@/components/empty-state";
import type { Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .not("full_name", "is", null)
    .order("created_at", { ascending: false });

  const people = (data ?? []) as Profile[];

  return (
    <div>
      <Topbar title="People" />
      {people.length === 0 ? (
        <EmptyState title="No one here yet" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p) => (
            <div key={p.id} className="rounded-xl border border-line bg-white p-5">
              <div className="flex items-center gap-3">
                <Avatar name={p.full_name} size={48} />
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{p.full_name}</p>
                  <p className="text-sm text-ink-3">
                    {p.department} · {p.role}
                  </p>
                </div>
              </div>
              {p.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.skills.slice(0, 4).map((s) => (
                    <span key={s} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-800">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
