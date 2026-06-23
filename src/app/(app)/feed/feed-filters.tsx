// @ts-nocheck
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useRef, useState, useTransition } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGES, DOMAINS, ROLES_NEEDED, DEPARTMENTS } from "@/lib/constants";

const STAGE_OPTIONS = STAGES;
const DOMAIN_OPTIONS = DOMAINS;
const ROLE_OPTIONS = ROLES_NEEDED;

export function FeedFilters({
  q,
  stage,
  domain,
  role,
}: {
  q?: string;
  stage?: string;
  domain?: string;
  role?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(!!(stage || domain || role));
  const inputRef = useRef<HTMLInputElement>(null);

  const push = useCallback(
    (params: Record<string, string | undefined>) => {
      const sp = new URLSearchParams();
      if (params.q) sp.set("q", params.q);
      if (params.stage) sp.set("stage", params.stage);
      if (params.domain) sp.set("domain", params.domain);
      if (params.role) sp.set("role", params.role);
      startTransition(() => {
        router.push(pathname + (sp.toString() ? "?" + sp.toString() : ""));
      });
    },
    [router, pathname]
  );

  const current = { q, stage, domain, role };

  const set = (key: string, value: string | undefined) =>
    push({ ...current, [key]: value });

  const clearAll = () => push({});

  const hasAny = !!(q || stage || domain || role);

  const chipCls = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1.5 text-xs font-medium transition cursor-pointer",
      active
        ? "border-brand-600 bg-brand-600 text-white"
        : "border-line bg-white text-ink-2 hover:border-brand-200"
    );

  return (
    <div className="mb-5">
      {/* search row */}
      <div className="mb-3 flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5">
          <Search size={16} className="shrink-0 text-ink-3" />
          <input
            ref={inputRef}
            defaultValue={q ?? ""}
            placeholder="Search ventures by name, keyword..."
            className="flex-1 bg-transparent text-sm outline-none text-ink"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                set("q", (e.target as HTMLInputElement).value.trim() || undefined);
              }
            }}
          />
          {q && (
            <button
              onClick={() => {
                if (inputRef.current) inputRef.current.value = "";
                set("q", undefined);
              }}
              className="text-ink-3 hover:text-ink"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition",
            showFilters || (stage || domain || role)
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-line bg-white text-ink-2 hover:bg-brand-50"
          )}
        >
          <SlidersHorizontal size={16} />
          Filters
          {(stage || domain || role) && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-brand-600">
              {[stage, domain, role].filter(Boolean).length}
            </span>
          )}
        </button>

        {hasAny && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink-2 hover:bg-brand-50"
          >
            <X size={15} /> Clear
          </button>
        )}
      </div>

      {/* filter chips */}
      {showFilters && (
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-white p-4">

          <div>
            <p className="mb-2 text-xs font-medium text-ink-3">Stage</p>
            <div className="flex flex-wrap gap-2">
              {STAGE_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => set("stage", stage === s ? undefined : s)}
                  className={chipCls(stage === s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-ink-3">Domain</p>
            <div className="flex flex-wrap gap-2">
              {DOMAIN_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => set("domain", domain === d ? undefined : d)}
                  className={chipCls(domain === d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-ink-3">Looking for</p>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => set("role", role === r ? undefined : r)}
                  className={chipCls(role === r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* active filter summary */}
      {hasAny && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-3">Showing results for:</span>
          {q && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-800">
              "{q}"
              <button onClick={() => { if (inputRef.current) inputRef.current.value = ""; set("q", undefined); }}>
                <X size={11} />
              </button>
            </span>
          )}
          {stage && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-800">
              {stage}
              <button onClick={() => set("stage", undefined)}><X size={11} /></button>
            </span>
          )}
          {domain && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-800">
              {domain}
              <button onClick={() => set("domain", undefined)}><X size={11} /></button>
            </span>
          )}
          {role && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-800">
              {role}
              <button onClick={() => set("role", undefined)}><X size={11} /></button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}