"use client";

import { useActionState } from "react";
import { sendMagicLink, type AuthState } from "@/actions/auth";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MailCheck } from "lucide-react";

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(sendMagicLink, {});

  if (state.sent) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <MailCheck size={22} />
        </div>
        <p className="font-medium text-ink">Check your inbox</p>
        <p className="mt-1 text-sm text-ink-2">
          We sent a sign-in link to your IITB email. Open it on this device to continue.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <Label>Institute email</Label>
        <Input name="email" type="email" placeholder="rollno@iitb.ac.in" required autoFocus />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send sign-in link"}
      </Button>
      <p className="text-center text-xs text-ink-3">Only @iitb.ac.in addresses can sign in.</p>
    </form>
  );
}
