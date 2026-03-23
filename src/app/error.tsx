"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-6 py-16">
      <h1 className="text-center text-2xl font-bold text-text-primary">Something went wrong</h1>
      <p className="mt-3 max-w-md text-center text-sm text-text-secondary">
        The page hit an unexpected error. You can try again or return home. If the screen was blank before
        this message, a redeploy or clearing site data may help.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="gradient-bg rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-border bg-surface px-6 py-2.5 text-sm font-semibold text-text-primary"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
