"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const raw = await res.text();
      let data = {} as { error?: string };
      try {
        data = raw ? (JSON.parse(raw) as { error?: string }) : {};
      } catch {
        setError(
          `Registration failed (HTTP ${res.status}). The server did not return JSON — often a crash or proxy error. Open Vercel → Deployments → your deployment → Functions / Logs and confirm DATABASE_URL / DIRECT_URL work.`
        );
        return;
      }
      if (!res.ok) {
        setError(data.error || `Registration failed (${res.status}).`);
        return;
      }
      let sign: Awaited<ReturnType<typeof signIn>>;
      try {
        sign = await signIn("credentials", {
          email: email.trim(),
          password,
          redirect: false,
        });
      } catch {
        setError(
          "Account may have been created. Try signing in manually. If sign-in also fails, check AUTH_URL and AUTH_SECRET on Vercel match this site."
        );
        return;
      }
      if (sign?.error) {
        setError("Account created but sign-in failed. Try logging in.");
        return;
      }
      router.push("/app");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(
        `Network or browser error: ${msg}. Check your connection, disable extensions that block requests, and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] min-h-screen flex-col items-center justify-center bg-background px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl sm:p-8"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 text-text-primary">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold">StyleSense</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-text-primary">Create account</h1>
          <p className="mt-2 text-sm text-text-secondary">Start your context-aware wardrobe.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-text-secondary">
              Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-base text-text-primary outline-none ring-primary/20 focus:border-primary focus:ring-2 sm:text-sm"
            />
          </div>
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
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-base text-text-primary outline-none ring-primary/20 focus:border-primary focus:ring-2 sm:text-sm"
            />
            <p className="mt-1 text-xs text-text-muted">At least 8 characters.</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="gradient-bg w-full rounded-xl py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
