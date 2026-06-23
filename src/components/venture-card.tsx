import Link from "next/link";
import { StageBadge } from "@/components/stage-badge";
import type { VentureWithOwner } from "@/types/database";
import { ChevronRight } from "lucide-react";

export function VentureCard({ venture }: { venture: VentureWithOwner }) {
  return (
    <Link
      href={`/ventures/${venture.id}`}
      className="group flex flex-col rounded-xl border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-100"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold leading-tight text-ink">{venture.title}</h3>
        <StageBadge stage={venture.stage} />
      </div>

      <p className="text-sm text-ink-2">{venture.one_liner}</p>

      {venture.roles_needed.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {venture.roles_needed.map((r) => (
            <span
              key={r}
              className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs text-brand-800"
            >
              {r}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm text-ink-3">
        <span>
          {venture.owner?.full_name ?? "A student"}
          {venture.owner?.department ? ` · ${venture.owner.department}` : ""}
        </span>
        <ChevronRight size={18} className="text-ink-3 transition group-hover:text-brand-600" />
      </div>
    </Link>
  );
}
