"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/app/AppHeader";
import { Sidebar } from "@/components/app/Sidebar";

function headerForPath(pathname: string): { title: string; subtitle?: string } {
  const p = pathname.replace(/\/$/, "") || "/";
  if (p === "/app") {
    return {
      title: "Dashboard",
      subtitle: "Your style overview at a glance",
    };
  }
  if (p.startsWith("/app/wardrobe")) {
    return {
      title: "My Wardrobe",
      subtitle: "Browse and manage your clothing",
    };
  }
  if (p.startsWith("/app/memories")) {
    return {
      title: "Outfit Memory",
      subtitle: "Your style journey, remembered",
    };
  }
  if (p.startsWith("/app/planner")) {
    return {
      title: "Travel Planner",
      subtitle: "Pack perfectly for every trip",
    };
  }
  if (p.startsWith("/app/style-match")) {
    return {
      title: "Style Match",
      subtitle: "Find pieces that fit your vibe",
    };
  }
  if (p.startsWith("/app/analytics")) {
    return {
      title: "Analytics",
      subtitle: "How you wear what you own",
    };
  }
  if (p.startsWith("/app/profile")) {
    return {
      title: "Profile",
      subtitle: "Account and preferences",
    };
  }
  return { title: "StyleSense" };
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const header = useMemo(() => headerForPath(pathname), [pathname]);

  return (
    <div className="min-h-[100dvh] min-h-screen bg-background">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className="min-h-[100dvh] min-h-screen md:ml-[280px]">
        <AppHeader
          title={header.title}
          subtitle={header.subtitle}
          onMenuToggle={() => setMobileSidebarOpen((open) => !open)}
        />
        <main className="px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
