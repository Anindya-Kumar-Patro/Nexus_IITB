// @ts-nocheck
"use client";
import { useActionState } from "react";
import { Input, Textarea, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChipSelect } from "@/components/chip-select";
import { STAGES, ROLES_NEEDED, DOMAINS, VENTURE_TYPES } from "@/lib/constants";

export function VentureForm({ action, venture, submitLabel }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="flex flex-col gap-4 sm:gap-5">
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
          rows={5}
          defaultValue={venture?.description}
          placeholder="The problem, your solution, and where things stand."
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Type</Label>
          <Select name="venture_type" defaultValue={venture?.venture_type ?? "startup"}>
            {VENTURE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Stage</Label>
          <Select name="stage" defaultValue={venture?.stage ?? "Brainstorming"}>
            {STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Domain</Label>
          <Select name="domain" defaultValue={venture?.domain ?? ""}>
            <option value="">Select...</option>
            {DOMAINS.map((d) => (
              <option key={d} value={d}>{d}</option>
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
      <Button type="submit" disabled={pending} className="w-full sm:w-auto sm:self-start">
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
