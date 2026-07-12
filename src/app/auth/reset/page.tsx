// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ResetForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setError("Invalid or expired reset link. Please request a new one.");
      return;
    }
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setError("Invalid or expired reset link. Please request a new one.");
      } else {
        setReady(true);
      }
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setPending(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError("Could not update password. Please try again.");
      setPending(false);
    } else {
      router.push("/feed");
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink">Set new password</h1>
        <p className="mt-1 text-sm text-ink-3">Enter your new password below.</p>
      </div>

      {error && !ready ? (
        <div>
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          <a href="/feed" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
            Back to home
          </a>
        </div>
      ) : !ready ? (
        <p className="text-sm text-ink-3">Verifying your reset link...</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label>New password</Label>
            <Input
              type="password"
              minLength={6}
              required
              autoFocus
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "Updating…" : "Update password"}
          </Button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
      <Suspense fallback={<div className="text-sm text-ink-3">Loading...</div>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
