"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Droplets,
  Heart,
  ImageIcon,
  MapPin,
  Plane,
  RefreshCw,
  Shirt,
  ThumbsDown,
  ThumbsUp,
  Wind,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { getWeatherByCity } from "@/lib/weather";
import type { ClothingItem, OutfitMemory, WeatherData } from "@/lib/types";
import {
  cn,
  formatDate,
  formatTemp,
  getCategoryIcon,
  getGreeting,
  getWeatherEmoji,
  suggestOutfit,
} from "@/lib/utils";

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-surface-alt" />
      <div className="h-48 animate-pulse rounded-2xl bg-surface-alt" />
      <div className="h-40 animate-pulse rounded-2xl bg-surface-alt" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-alt" />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-2xl bg-surface-alt" />
    </div>
  );
}

function OutfitItemCard({ item }: { item: ClothingItem }) {
  return (
    <div
      className="glass flex min-w-[160px] shrink-0 flex-col gap-2 rounded-xl border border-border p-4 shadow-sm"
      style={{ borderTopWidth: 4, borderTopColor: item.colorHex }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-lg leading-none">{getCategoryIcon(item.category)}</span>
        <span
          className="h-4 w-4 shrink-0 rounded-full border border-border"
          style={{ backgroundColor: item.colorHex }}
          title={item.color}
        />
      </div>
      <p className="line-clamp-2 text-sm font-medium text-text-primary">{item.name}</p>
      <p className="text-xs capitalize text-text-muted">{item.category}</p>
    </div>
  );
}

function MemoryCard({ memory }: { memory: OutfitMemory }) {
  return (
    <div className="glass card-hover flex flex-col gap-3 rounded-xl border border-border p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-text-primary">{memory.outfit.name}</p>
          <div className="mt-1 flex items-center gap-1 text-sm text-text-secondary">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{memory.location}</span>
          </div>
        </div>
        <span className="text-2xl" aria-hidden>
          {getWeatherEmoji(memory.weather.condition)}
        </span>
      </div>
      <p className="text-xs text-text-muted">{formatDate(memory.date)}</p>
    </div>
  );
}

export default function AppDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const hydrated = useStore((s) => s.hydrated);
  const user = useStore((s) => s.user);
  const wardrobe = useStore((s) => s.wardrobe);
  const memories = useStore((s) => s.memories);
  const trips = useStore((s) => s.trips);
  const submitOutfitFeedback = useStore((s) => s.submitOutfitFeedback);

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);
  const [outfitRefresh, setOutfitRefresh] = useState(0);
  const [feedbackBusy, setFeedbackBusy] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    setWeatherLoading(true);
    setWeatherError(false);
    getWeatherByCity(user.location)
      .then((w) => {
        if (!cancelled) {
          setWeather(w);
        }
      })
      .catch(() => {
        if (!cancelled) setWeatherError(true);
      })
      .finally(() => {
        if (!cancelled) setWeatherLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mounted, user.location]);

  const suggestedOutfit = useMemo(() => {
    if (!weather || wardrobe.length === 0) return [];
    return suggestOutfit(wardrobe, weather);
  }, [wardrobe, weather, outfitRefresh]);

  const recentMemories = useMemo(() => {
    return [...memories]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [memories]);

  const favoriteCount = useMemo(
    () => wardrobe.filter((i) => i.favorite).length,
    [wardrobe]
  );

  const sendSuggestionFeedback = async (liked: boolean) => {
    if (!weather || suggestedOutfit.length === 0) return;
    setFeedbackBusy(true);
    setFeedbackMsg(null);
    const ok = await submitOutfitFeedback({
      liked,
      itemIds: suggestedOutfit.map((i) => i.id),
      weather,
    });
    setFeedbackMsg(
      ok
        ? liked
          ? "Thanks — we will prioritize similar picks."
          : "Thanks — we will tune future suggestions."
        : "Could not save feedback. Try again."
    );
    setFeedbackBusy(false);
  };

  if (!mounted || !hydrated) {
    return <DashboardSkeleton />;
  }

  const unit = user.temperatureUnit;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
            {getGreeting()},{" "}
            <span className="gradient-text">
              {(user.name?.trim() && user.name.split(" ")[0]) || "there"}
            </span>
          </h1>
          <p className="mt-2 text-text-secondary">Here is what is happening with your style today.</p>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <div className="gradient-bg relative overflow-hidden rounded-2xl p-6 text-white shadow-lg md:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-black/10 blur-2xl" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">{user.location}</p>
                {weatherLoading ? (
                  <div className="mt-3 h-14 w-40 animate-pulse rounded-lg bg-white/20" />
                ) : weatherError || !weather ? (
                  <p className="mt-2 text-lg text-white/90">Weather unavailable</p>
                ) : (
                  <>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-5xl font-light md:text-6xl">
                        {getWeatherEmoji(weather.condition)}
                      </span>
                      <div>
                        <p className="text-4xl font-semibold tabular-nums md:text-5xl">
                          {formatTemp(weather.temp, unit)}
                        </p>
                        <p className="text-sm capitalize text-white/85">
                          {weather.description}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              {!weatherLoading && weather && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
                  <div className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                    <p className="text-xs text-white/75">High</p>
                    <p className="text-lg font-semibold tabular-nums">
                      {formatTemp(weather.high, unit)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                    <p className="text-xs text-white/75">Low</p>
                    <p className="text-lg font-semibold tabular-nums">
                      {formatTemp(weather.low, unit)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                    <div className="flex items-center gap-1.5 text-xs text-white/75">
                      <Droplets className="h-3.5 w-3.5" />
                      Humidity
                    </div>
                    <p className="text-lg font-semibold tabular-nums">{weather.humidity}%</p>
                  </div>
                  <div className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                    <div className="flex items-center gap-1.5 text-xs text-white/75">
                      <Wind className="h-3.5 w-3.5" />
                      Wind
                    </div>
                    <p className="text-lg font-semibold tabular-nums">{weather.windSpeed} m/s</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-text-primary">Today&apos;s Outfit</h2>
            <button
              type="button"
              onClick={() => setOutfitRefresh((k) => k + 1)}
              disabled={!weather || wardrobe.length === 0}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary shadow-sm transition hover:border-primary/40 hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
          {!weather || wardrobe.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-text-secondary">
              {!wardrobe.length
                ? "Add items to your wardrobe to get outfit suggestions."
                : "Loading weather to tailor your look."}
            </div>
          ) : suggestedOutfit.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center text-text-secondary">
              No matching pieces for this weather. Try adding more versatile items.
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {suggestedOutfit.map((item) => (
                <OutfitItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
          {weather && suggestedOutfit.length > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-text-secondary">How does this suggestion look?</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={feedbackBusy}
                  onClick={() => void sendSuggestionFeedback(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary shadow-sm transition hover:border-success/50 hover:bg-success/10 disabled:opacity-50"
                >
                  <ThumbsUp className="h-4 w-4 text-success" />
                  Love it
                </button>
                <button
                  type="button"
                  disabled={feedbackBusy}
                  onClick={() => void sendSuggestionFeedback(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary shadow-sm transition hover:border-danger/50 hover:bg-danger/10 disabled:opacity-50"
                >
                  <ThumbsDown className="h-4 w-4 text-danger" />
                  Not quite
                </button>
              </div>
            </div>
          )}
          {feedbackMsg && (
            <p className="text-sm text-text-muted">
              {feedbackMsg}
            </p>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          {[
            {
              label: "Total Items",
              value: wardrobe.length,
              icon: Shirt,
              accent: "text-primary",
            },
            {
              label: "Outfits Saved",
              value: memories.length,
              icon: ImageIcon,
              accent: "text-accent",
            },
            {
              label: "Trips Planned",
              value: trips.length,
              icon: Plane,
              accent: "text-primary",
            },
            {
              label: "Favorites",
              value: favoriteCount,
              icon: Heart,
              accent: "text-danger",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.18 + i * 0.05 }}
              className="card-hover glass rounded-xl border border-border p-4"
            >
              <div className="flex items-center justify-start">
                <stat.icon className={cn("h-5 w-5", stat.accent)} />
              </div>
              <p className="mt-3 text-3xl font-bold tabular-nums text-text-primary">{stat.value}</p>
              <p className="mt-1 text-sm text-text-secondary">{stat.label}</p>
            </motion.div>
          ))}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold text-text-primary">Recent Memories</h2>
          {recentMemories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-text-secondary">
              No memories yet. Save outfits to see them here.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {recentMemories.map((memory, idx) => (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.22 + idx * 0.06 }}
                >
                  <MemoryCard memory={memory} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
