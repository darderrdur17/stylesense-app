"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Bell, Moon, Navigation, UserRound } from "lucide-react";
import { requestGeolocationAndSaveProfile } from "@/lib/client-location";
import { useStore } from "@/lib/store";
import type { StyleTag } from "@/lib/types";
import { cn, initialsFromName } from "@/lib/utils";

const ALL_STYLE_TAGS: StyleTag[] = [
  "casual",
  "formal",
  "athletic",
  "streetwear",
  "bohemian",
  "minimalist",
  "vintage",
  "preppy",
  "elegant",
];

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="h-10 w-56 animate-pulse rounded-lg bg-surface-alt" />
      <div className="h-48 animate-pulse rounded-2xl bg-surface-alt" />
      <div className="h-64 animate-pulse rounded-2xl bg-surface-alt" />
    </div>
  );
}

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const hydrated = useStore((s) => s.hydrated);
  const user = useStore((s) => s.user);
  const wardrobe = useStore((s) => s.wardrobe);
  const setUser = useStore((s) => s.setUser);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [temperatureUnit, setTemperatureUnit] = useState<"celsius" | "fahrenheit">(
    "celsius"
  );
  const [preferredStyles, setPreferredStyles] = useState<StyleTag[]>([]);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [darkModeOn, setDarkModeOn] = useState(false);
  const [profileLat, setProfileLat] = useState<number | null>(null);
  const [profileLng, setProfileLng] = useState<number | null>(null);
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setName(user.name);
    setEmail(user.email);
    setLocation(user.location);
    setTemperatureUnit(user.temperatureUnit);
    setPreferredStyles([...user.preferredStyles]);
    setProfileLat(user.latitude ?? null);
    setProfileLng(user.longitude ?? null);
  }, [mounted, user]);

  const handleUseCurrentLocation = async () => {
    setGeoError(null);
    setGeoBusy(true);
    const result = await requestGeolocationAndSaveProfile(setUser, {
      fallbackLocationLabel: location,
    });
    setGeoBusy(false);
    if (!result.ok) {
      setGeoError(result.error ?? "Could not get your location.");
    }
  };

  const clearSavedCoords = async () => {
    setGeoError(null);
    const ok = await setUser({ latitude: null, longitude: null });
    if (!ok) {
      setGeoError("Could not clear saved coordinates. Try again.");
    }
  };

  const summary = useMemo(() => {
    const total = wardrobe.length;
    const categories = new Set(wardrobe.map((i) => i.category)).size;
    const colorCounts = new Map<string, number>();
    wardrobe.forEach((i) => {
      colorCounts.set(i.color, (colorCounts.get(i.color) ?? 0) + 1);
    });
    let topColor = "—";
    let maxC = 0;
    colorCounts.forEach((n, c) => {
      if (n > maxC) {
        maxC = n;
        topColor = c;
      }
    });
    return { total, categories, topColor };
  }, [wardrobe]);

  const memberSince = useMemo(() => {
    try {
      return format(parseISO(user.joinDate), "MMMM d, yyyy");
    } catch {
      return user.joinDate;
    }
  }, [user.joinDate]);

  const toggleStyle = (tag: StyleTag) => {
    setPreferredStyles((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    setSaveError(null);
    const ok = await setUser({
      name,
      email,
      location,
      temperatureUnit,
      preferredStyles,
      latitude: profileLat,
      longitude: profileLng,
    });
    if (!ok) {
      setSaveError("Could not save profile. Check your connection and try again.");
    }
  };

  if (!mounted || !hydrated) {
    return (
      <div className="min-h-[60vh] bg-background">
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-8">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="flex items-center gap-2">
          <UserRound className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
            Profile &amp; Settings
          </h1>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="card-hover rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-8"
      >
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-bold text-white shadow-lg">
            {initialsFromName(name || user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xl font-semibold text-text-primary">{user.name}</p>
            <p className="mt-1 text-sm text-text-secondary">{user.email}</p>
            <p className="mt-2 text-sm text-text-muted">
              Member since {memberSince}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-8"
      >
        <h2 className="text-lg font-semibold text-text-primary">Personal Info</h2>
        <div className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="profile-name"
              className="text-sm font-medium text-text-secondary"
            >
              Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-text-primary outline-none ring-primary/20 transition focus:border-primary focus:ring-2"
            />
          </div>
          <div>
            <label
              htmlFor="profile-email"
              className="text-sm font-medium text-text-secondary"
            >
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-text-primary outline-none ring-primary/20 transition focus:border-primary focus:ring-2"
            />
          </div>
          <div className="rounded-xl border border-border bg-surface-alt/40 p-4">
            <h3 className="text-sm font-semibold text-text-primary">Location for weather</h3>
            <p className="mt-1 text-xs text-text-secondary">
              Enable location access for accurate local forecasts. Your coordinates are saved to your
              profile only.
            </p>
            <label
              htmlFor="profile-location"
              className="mt-4 block text-sm font-medium text-text-secondary"
            >
              City or area (display)
            </label>
            <input
              id="profile-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-text-primary outline-none ring-primary/20 transition focus:border-primary focus:ring-2"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void handleUseCurrentLocation()}
                disabled={geoBusy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-alt px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-primary/40 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Navigation className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {geoBusy ? "Getting location…" : "Use current location"}
              </button>
              {(profileLat != null || profileLng != null) && (
                <button
                  type="button"
                  onClick={() => void clearSavedCoords()}
                  className="text-xs font-medium text-text-muted underline-offset-2 hover:text-text-primary hover:underline"
                >
                  Clear saved coordinates
                </button>
              )}
            </div>
            {geoError && (
              <p className="mt-2 text-xs text-danger" role="alert">
                {geoError}
              </p>
            )}
            {(profileLat != null || profileLng != null) && (
              <p className="mt-2 text-xs text-text-muted">
                Weather uses your saved coordinates. City name is for display only.
              </p>
            )}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-8"
      >
        <h2 className="text-lg font-semibold text-text-primary">Preferences</h2>
        <p className="mt-1 text-sm text-text-secondary">Temperature unit</p>
        <div className="mt-3 inline-flex rounded-xl border border-border bg-surface-alt p-1">
          <button
            type="button"
            onClick={() => setTemperatureUnit("celsius")}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition",
              temperatureUnit === "celsius"
                ? "gradient-bg text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            Celsius
          </button>
          <button
            type="button"
            onClick={() => setTemperatureUnit("fahrenheit")}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition",
              temperatureUnit === "fahrenheit"
                ? "gradient-bg text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            Fahrenheit
          </button>
        </div>
        <p className="mt-8 text-sm text-text-secondary">Preferred styles</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ALL_STYLE_TAGS.map((tag) => {
            const on = preferredStyles.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleStyle(tag)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition",
                  on
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-text-secondary hover:border-primary/30"
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12 }}
        className="rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-8"
      >
        <h2 className="text-lg font-semibold text-text-primary">App Settings</h2>
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface-alt px-4 py-3">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-text-primary">
                Notifications
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notificationsOn}
              onClick={() => setNotificationsOn((v) => !v)}
              className={cn(
                "relative h-7 w-12 rounded-full transition",
                notificationsOn ? "bg-primary" : "bg-border"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition",
                  notificationsOn ? "left-5" : "left-0.5"
                )}
              />
            </button>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface-alt px-4 py-3">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-text-primary">
                Dark mode
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={darkModeOn}
              onClick={() => setDarkModeOn((v) => !v)}
              className={cn(
                "relative h-7 w-12 rounded-full transition",
                darkModeOn ? "bg-primary" : "bg-border"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition",
                  darkModeOn ? "left-5" : "left-0.5"
                )}
              />
            </button>
          </div>
        </div>
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.14 }}
        className="flex flex-col items-end gap-2"
      >
        {saveError && (
          <p className="max-w-md text-right text-sm text-danger" role="alert">
            {saveError}
          </p>
        )}
        <button
          type="button"
          onClick={() => void handleSave()}
          className="gradient-bg rounded-xl px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
        >
          Save Changes
        </button>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.16 }}
        className="rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-8"
      >
        <h2 className="text-lg font-semibold text-text-primary">
          Your Wardrobe Summary
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-surface-alt px-4 py-3 text-center">
            <p className="text-2xl font-bold tabular-nums text-text-primary">
              {summary.total}
            </p>
            <p className="text-xs text-text-muted">Total items</p>
          </div>
          <div className="rounded-xl bg-surface-alt px-4 py-3 text-center">
            <p className="text-2xl font-bold tabular-nums text-text-primary">
              {summary.categories}
            </p>
            <p className="text-xs text-text-muted">Categories</p>
          </div>
          <div className="rounded-xl bg-surface-alt px-4 py-3 text-center">
            <p className="line-clamp-2 text-lg font-semibold capitalize text-text-primary">
              {summary.topColor}
            </p>
            <p className="text-xs text-text-muted">Top color</p>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
