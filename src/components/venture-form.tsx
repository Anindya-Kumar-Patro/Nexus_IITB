"use client";

import { useActionState } from "react";
import { Input, Textarea, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChipSelect } from "@/components/chip-select";
import { STAGES, ROLES_NEEDED, DOMAINS } from "@/lib/constants";
import type { Venture } from "@/types/database";
import type { VentureState } from "@/actions/ventures";

export function VentureForm({
  action,
  venture,
  submitLabel,
}: {
  action: (prev: VentureState, fd: FormData) => Promise<VentureState>;
  venture?: Venture;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<VentureState, FormData>(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <Label>Title</Label>
        <Input name="title" defaultValue={venture?.title} placeholder="e.g. UPI-for-Mess" required />
      </div>

      <div>
        <Label>One-liner (max 60 chars)</Label>
        <Input
          name="one_liner"
          maxLength={60}
          defaultValue={venture?.one_liner}
          placeholder="The hook that makes people tap in"
          required
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          name="description"
          rows={6}
          defaultValue={venture?.description}
          placeholder="The problem, your solution, and where things stand."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Stage</Label>
          <Select name="stage" defaultValue={venture?.stage ?? "Brainstorming"}>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Domain</Label>
          <Select name="domain" defaultValue={venture?.domain ?? ""}>
            <option value="">Select…</option>
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label>Looking for</Label>
        <ChipSelect
          name="roles_needed"
          options={ROLES_NEEDED}
          defaultValue={venture?.roles_needed}
          allowCustom
          placeholder="e.g. ML engineer"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}