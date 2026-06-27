// @ts-nocheck
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/topbar";
import { Avatar } from "@/components/avatar";
import { EmptyState } from "@/components/empty-state";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

function roleLabel(role) {
  if (!role) return "";
  if (role ?.toLowerCase() === "both") return "Founder & Builder";
  return role;
}

export default async function PeoplePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .not("full_name", "is", null)
    .order("created_at", { ascending: false });

  const people = data ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <div style={{ flex: 1 }}>
        <Topbar title="People" />
        {people.length === 0 ? (
          <EmptyState title="No one here yet" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((p) => (
              <Link
                key={p.id}
                href={"/people/" + p.id}
                className="group rounded-xl border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-100"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={p.full_name} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink group-hover:text-brand-800">
                      {p.full_name}
                    </p>
                    <p className="text-sm text-ink-3">
                      {p.department} · {roleLabel(p.role)}
                    </p>
                  </div>
                </div>
                {p.skills && p.skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.skills.slice(0, 4).map((s) => (
                      <span key={s} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-800">
                        {s}
                      </span>
                    ))}
                    {p.skills.length > 4 && (
                      <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-ink-3">
                        +{p.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
      <div style={{ marginTop: "48px" }}>
        <Footer />
      </div>
    </div>
  );
}
