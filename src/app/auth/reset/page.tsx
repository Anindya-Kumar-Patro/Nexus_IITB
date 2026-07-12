// @ts-nocheck
"use client";
import { useActionState } from "react";
import { updatePassword, type AuthState } from "@/actions/auth";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, {});

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-ink">Set new password</h1>
          <p className="mt-1 text-sm text-ink-3">Enter your new password below.</p>
        </div>
        <form action={action} className="flex flex-col gap-4">
          <div>
            <Label>New password</Label>
            <Input name="password" type="password" minLength={6} required autoFocus
              placeholder="At least 6 characters" />
          </div>
          {state.error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "Updating…" : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
