"use client";

import { useActionState } from "react";
import { saveProfile, type ProfileState } from "@/actions/profile";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChipSelect } from "@/components/chip-select";
import { DEPARTMENTS, ROLES, SKILLS } from "@/lib/constants";
import type { Profile } from "@/types/database";

export function ProfileForm({ profile }: { profile?: Profile }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(saveProfile, {});

  return (
    <form action={action} className="flex flex-col gap-5">
      <div>
        <Label>Full name</Label>
        <Input name="full_name" defaultValue={profile?.full_name ?? ""} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Roll number</Label>
          <Input name="roll_number" defaultValue={profile?.roll_number ?? ""} placeholder="21B0042" required />
        </div>
        <div>
          <Label>Department</Label>
          <Select name="department" defaultValue={profile?.department ?? ""} required>
            <option value="">Select…</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label>I am a…</Label>
        <Select name="role" defaultValue={profile?.role ?? ""} required>
          <option value="">Select…</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Skills</Label>
        <ChipSelect name="skills" options={SKILLS} defaultValue={profile?.skills ?? []} />
      </div>

      <div>
        <Label>LinkedIn URL (optional)</Label>
        <Input
          name="linkedin_url"
          type="url"
          defaultValue={profile?.linkedin_url ?? ""}
          placeholder="https://linkedin.com/in/…"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
