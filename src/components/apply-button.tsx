// @ts-nocheck
"use client";

import { useActionState, useState } from "react";
import { X } from "lucide-react";
import { applyToVenture, type ApplyState } from "@/actions/applications";
import { AuthModal } from "@/components/auth-modal";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/input";
import { APPLICATION_STATUS_STYLES } from "@/lib/constants";
import type { ApplicationStatus } from "@/types/database";

export function ApplyButton({
  ventureId,
  roles,
  isAuthed,
  existingStatus,
}: {
  ventureId: string;
  roles: string[];
  isAuthed: boolean;
  existingStatus: ApplicationStatus | null;
}) {
  const [authOpen, setAuthOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const boundAction = applyToVenture.bind(null, ventureId);
  const [state, formAction, pending] = useActionState<ApplyState, FormData>(boundAction, {});

  if (existingStatus) {
    return (
      <span className={`inline-flex items-center rounded-full px-3.5 py-2 text-sm font-medium ${APPLICATION_STATUS_STYLES[existingStatus]}`}>
        Applied · {existingStatus}
      </span>
    );
  }

  const roleOptions = roles.length > 0 ? roles : ["Co-founder", "Team member"];

  return (
    <>
      <Button onClick={() => (isAuthed ? setDialogOpen(true) : setAuthOpen(true))}>
        Apply
      </Button>

      {dialogOpen && !state.ok && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-10"
          onClick={() => setDialogOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Apply to join</h2>
              <button onClick={() => setDialogOpen(false)} aria-label="Close" className="text-ink-3 hover:text-ink">
                <X size={20} />
              </button>
            </div>
            <form action={formAction} className="flex flex-col gap-4">
              <div>
                <Label>Applying as</Label>
                <Select name="role" defaultValue={roleOptions[0]} required>
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Message</Label>
                <Textarea
                  name="message"
                  rows={4}
                  placeholder="Why you are a good fit, what you would bring to the venture..."
                  required
                />
                <p className="mt-1 text-xs text-ink-3">Required — tell the founder why you are the right person.</p>
              </div>
              {state.error && <p className="text-sm text-red-600">{state.error}</p>}
              <Button type="submit" disabled={pending}>
                {pending ? "Sending..." : "Send application"}
              </Button>
            </form>
          </div>
        </div>
      )}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
