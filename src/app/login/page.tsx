"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { DEMO_USER_EMAIL, DEMO_USER_PASSWORD } from "@/lib/demo-account";

const showDemoLogin =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_SHOW_DEMO_LOGIN === "true";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl sm:p-8">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-2 text-text-primary">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold">StyleSense</span>
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-text-primary">Sign in</h1>
        <p className="mt-2 text-sm text-text-secondary">Use your account to access your wardrobe.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-text-secondary">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-base text-text-primary outline-none ring-primary/20 focus:border-primary focus:ring-2 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-text-secondary">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-base text-text-primary outline-none ring-primary/20 focus:border-primary focus:ring-2 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="gradient-bg w-full rounded-xl py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        {showDemoLogin && (
          <div className="rounded-xl border border-border/80 bg-surface-alt/80 px-4 py-3">
            <p className="text-xs font-medium text-text-secondary">Demo account</p>
            <p className="mt-1 break-all font-mono text-xs text-text-muted">{DEMO_USER_EMAIL}</p>
            <button
              type="button"
              onClick={() => {
                setEmail(DEMO_USER_EMAIL);
                setPassword(DEMO_USER_PASSWORD);
              }}
              className="mt-2 w-full rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10"
            >
              Fill demo email &amp; password
            </button>
          </div>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        No account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[100dvh] min-h-screen flex-col items-center justify-center bg-background px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full"
      >
        <Suspense fallback={<div className="mx-auto h-96 max-w-md animate-pulse rounded-2xl bg-surface-alt" />}>
          <LoginForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
