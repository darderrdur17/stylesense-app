"use client";

import Link from "next/link";
import { Bell, Menu, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { initialsFromName } from "@/lib/utils";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
};

export function AppHeader({ title, subtitle, onMenuToggle }: AppHeaderProps) {
  const user = useStore((s) => s.user);
  const initials = initialsFromName(user.name || "?");

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-surface/80 backdrop-blur-xl">
      <div className="flex min-h-[4rem] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-surface text-text-primary shadow-sm transition hover:bg-surface-alt md:hidden"
            onClick={onMenuToggle}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-text-primary sm:text-xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-0.5 hidden truncate text-sm text-text-secondary sm:block">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="hidden flex-1 items-center justify-end gap-3 sm:flex sm:max-w-md lg:max-w-lg">
          <label className="relative block w-full">
            <span className="sr-only">Search</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              strokeWidth={2}
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search clothes, outfits..."
              className="w-full rounded-xl border border-border/80 bg-surface-alt/80 py-2.5 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted outline-none ring-primary/20 transition focus:border-primary/40 focus:bg-surface focus:ring-2"
            />
          </label>
          <button
            type="button"
            className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-surface text-text-secondary transition hover:bg-surface-alt hover:text-text-primary"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" strokeWidth={2} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-surface" />
          </button>
          <Link
            href="/app/profile"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary ring-2 ring-primary/10 transition hover:bg-primary/20"
            aria-label="Account"
          >
            {initials}
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <button
            type="button"
            className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-surface text-text-secondary"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" strokeWidth={2} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-surface" />
          </button>
          <Link
            href="/app/profile"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary ring-2 ring-primary/10"
            aria-label="Account"
          >
            {initials}
          </Link>
        </div>
      </div>

      <div className="border-t border-border/50 px-4 pb-3 pt-3 sm:hidden">
        <label className="relative block w-full">
          <span className="sr-only">Search</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search clothes, outfits..."
            className="w-full rounded-xl border border-border/80 bg-surface-alt/80 py-2.5 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted outline-none ring-primary/20 transition focus:border-primary/40 focus:bg-surface focus:ring-2"
          />
        </label>
      </div>
    </header>
  );
}
