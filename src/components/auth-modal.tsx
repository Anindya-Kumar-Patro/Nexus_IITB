// @ts-nocheck
"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "@/actions/auth";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChipSelect } from "@/components/chip-select";
import { DEPARTMENTS, ROLES, SKILLS, ACCOUNT_TYPES } from "@/lib/constants";
import { X, MailCheck } from "lucide-react";

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-10"
      onClick={onClose}
    >
      <div
        className={`w-full rounded-2xl bg-white p-6 shadow-xl ${
          mode === "signup" ? "max-w-2xl" : "max-w-md"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex gap-1 rounded-full bg-brand-50 p-1">
            <button
              onClick={() => setMode("signin")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                mode === "signin" ? "bg-white text-brand-800 shadow-sm" : "text-ink-2"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                mode === "signup" ? "bg-white text-brand-800 shadow-sm" : "text-ink-2"
              }`}
            >
              Sign up
            </button>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-ink-3 hover:text-ink">
            <X size={20} />
          </button>
        </div>

        {mode === "signin" ? <SignInForm /> : <SignUpForm />}
      </div>
    </div>
  );
}

function SignInForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-ink">Welcome back</h2>
      <div>
        <Label>IITB email</Label>
        <Input name="email" type="email" placeholder="rollno@iitb.ac.in" required autoFocus />
      </div>
      <div>
        <Label>Password</Label>
        <Input name="password" type="password" required />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

function SignUpForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(signUp, {});

  if (state.sent) {
    return (
      <div className="flex flex-col items-center py-4 text-center">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <MailCheck size={22} />
        </div>
        <p className="font-medium text-ink">Confirm your email</p>
        <p className="mt-1 text-sm text-ink-2">
          We sent a confirmation link to your inbox. Click it, then come back and sign in.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <h2 className="text-lg font-semibold text-ink sm:col-span-2">Join Nexus</h2>

      <div>
        <Label>Full name</Label>
        <Input name="full_name" required autoFocus />
      </div>
      <div>
        <Label>I am a…</Label>
        <Select name="account_type" defaultValue="student" required>
          {ACCOUNT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Roll / ID number</Label>
        <Input name="roll_number" placeholder="21B0042" required />
      </div>
      <div>
        <Label>Department</Label>
        <Select name="department" defaultValue="" required>
          <option value="">Select…</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Joining as</Label>
        <Select name="role" defaultValue="" required>
          <option value="">Select…</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>LinkedIn URL (optional)</Label>
        <Input name="linkedin_url" type="url" placeholder="https://linkedin.com/in/…" />
      </div>

      <div>
        <Label>Email</Label>
        <Input name="email" type="email" placeholder="rollno@iitb.ac.in" required />
      </div>
      <div>
        <Label>Password</Label>
        <Input name="password" type="password" minLength={6} required />
      </div>

      <div className="sm:col-span-2">
        <Label>Skills (optional)</Label>
        <ChipSelect name="skills" options={SKILLS} />
      </div>

      {state.error && <p className="text-sm text-red-600 sm:col-span-2">{state.error}</p>}
      <Button type="submit" disabled={pending} className="justify-self-start sm:col-span-2">
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}