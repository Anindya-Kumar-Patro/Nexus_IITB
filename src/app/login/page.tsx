import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-sidebar px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white">
            <span className="text-xl font-semibold">N</span>
          </div>
          <h1 className="text-2xl font-semibold text-white">Nexus IITB</h1>
          <p className="mt-2 text-sm text-white/60">
            The startup network for IIT Bombay. Sign in with your institute email.
          </p>
        </div>
        <div className="rounded-xl bg-white p-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
