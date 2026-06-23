"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Toggleable chips that emit chosen values as hidden inputs so it works inside
// a plain <form> with Server Actions. Set allowCustom to let users type their own.
export function ChipSelect({
  name,
  options,
  defaultValue = [],
  allowCustom = false,
  placeholder = "Add your own…",
}: {
  name: string;
  options: string[];
  defaultValue?: string[];
  allowCustom?: boolean;
  placeholder?: string;
}) {
  const [selected, setSelected] = useState<string[]>(defaultValue);
  const [draft, setDraft] = useState("");

  const toggle = (value: string) =>
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );

  const addCustom = () => {
    const value = draft.trim();
    setDraft("");
    if (!value) return;
    setSelected((prev) => (prev.includes(value) ? prev : [...prev, value]));
  };

  // Values the user typed that aren't in the preset list.
  const customChips = selected.filter((v) => !options.includes(v));

  const base = "rounded-full border px-3.5 py-1.5 text-sm transition";
  const on = "border-brand-600 bg-brand-600 text-white";
  const off = "border-line bg-white text-ink-2 hover:border-brand-200";

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={cn(base, selected.includes(opt) ? on : off)}
          >
            {opt}
          </button>
        ))}

        {customChips.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => toggle(v)}
            className={cn(base, on, "inline-flex items-center gap-1")}
            aria-label={`Remove ${v}`}
          >
            {v}
            <X size={14} />
          </button>
        ))}
      </div>

      {allowCustom && (
        <div className="mt-2 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder={placeholder}
            className="w-56 rounded-full border border-line bg-white px-4 py-1.5 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="button"
            onClick={addCustom}
            className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-ink-2 transition hover:border-brand-200 hover:text-brand-800"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      )}

      {selected.map((v) => (
        <input key={v} type="hidden" name={name} value={v} />
      ))}
    </div>
  );
}