"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Camera,
  LayoutDashboard,
  LogOut,
  Palette,
  Plane,
  Settings,
  Shirt,
  Sparkles,
  User,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useDisplayUser } from "@/hooks/useDisplayUser";
import { cn, initialsFromName } from "@/lib/utils";

const navItems = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/wardrobe", label: "My Wardrobe", icon: Shirt },
  { href: "/app/memories", label: "Outfit Memory", icon: Camera },
  { href: "/app/planner", label: "Travel Planner", icon: Plane },
  { href: "/app/style-match", label: "Style Match", icon: Palette },
  { href: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/app/profile", label: "Profile", icon: User },
] as const;

function routeActive(pathname: string, href: string) {
  const p = pathname.replace(/\/$/, "") || "/";
  const h = href.replace(/\/$/, "") || "/";
  if (h === "/app") {
    return p === "/app";
  }
  return p === h || p.startsWith(`${h}/`);
}

type SidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { name, email } = useDisplayUser();
  const initials = initialsFromName(name || "?");

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = routeActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => onMobileClose()}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-text-secondary hover:bg-surface-alt hover:text-text-primary"
            )}
          >
            {active && (
              <span
                className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-accent"
                aria-hidden
              />
            )}
            <Icon
              className={cn(
                "h-5 w-5 shrink-0",
                active ? "text-primary" : "text-text-muted group-hover:text-text-secondary"
              )}
              strokeWidth={2}
              aria-hidden
            />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="border-b border-border/60 px-5 py-5">
      <Link
        href="/app"
        onClick={() => onMobileClose()}
        className="flex items-center gap-3 text-text-primary"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/10">
          <Sparkles className="h-5 w-5" strokeWidth={2} aria-hidden />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-semibold tracking-tight">StyleSense</span>
          <span className="text-xs font-medium text-text-muted">AI Wardrobe</span>
        </div>
      </Link>
    </div>
  );

  const footer = (
    <div className="border-t border-border/60 p-4">
      <div className="flex items-center gap-3 rounded-xl bg-surface-alt/80 px-3 py-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary ring-2 ring-primary/10"
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text-primary">
            {name || "Account"}
          </p>
          <p className="truncate text-xs text-text-muted">{email || "—"}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Link
            href="/app/profile"
            onClick={() => onMobileClose()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface hover:text-primary"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" strokeWidth={2} />
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface hover:text-danger"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );

  const shellClass =
    "flex h-full w-[280px] flex-col bg-surface/85 backdrop-blur-xl border-r border-border/60 shadow-[0_0_0_1px_rgba(26,27,46,0.04),0_12px_40px_-12px_rgba(26,27,46,0.12)]";

  return (
    <>
      <aside className={cn(shellClass, "fixed inset-y-0 left-0 z-40 hidden md:flex")}>
        {brand}
        {nav}
        {footer}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              key="sidebar-backdrop"
              className="fixed inset-0 z-40 bg-text-primary/40 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onMobileClose}
              aria-label="Close menu"
            />
            <motion.aside
              key="sidebar-drawer"
              className={cn(shellClass, "fixed inset-y-0 left-0 z-50 flex md:hidden")}
              initial={{ x: -24, opacity: 0.98 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0.98 }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
            >
              {brand}
              {nav}
              {footer}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
