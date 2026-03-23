"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarRange,
  Filter,
  ImageIcon,
  MapPin,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { isAfter, isBefore, parseISO, startOfDay } from "date-fns";
import { useStore } from "@/lib/store";
import type { Outfit, StyleTag, WeatherCondition, WeatherData } from "@/lib/types";
import {
  cn,
  formatDate,
  formatTemp,
  generateId,
  getWeatherEmoji,
  suggestOutfit,
} from "@/lib/utils";
import { getHistoricalWeather } from "@/lib/weather";

const WEATHER_CONDITIONS: WeatherCondition[] = [
  "sunny",
  "cloudy",
  "rainy",
  "snowy",
  "windy",
  "stormy",
  "foggy",
];

const MOOD_OPTIONS = [
  { value: "happy", label: "Happy", emoji: "😊" },
  { value: "adventurous", label: "Adventurous", emoji: "🧭" },
  { value: "cozy", label: "Cozy", emoji: "🧶" },
  { value: "elegant", label: "Elegant", emoji: "✨" },
  { value: "relaxed", label: "Relaxed", emoji: "🌿" },
] as const;

function moodDisplay(mood?: string): { label: string; emoji: string } {
  const found = MOOD_OPTIONS.find((m) => m.value === mood);
  if (found) return { label: found.label, emoji: found.emoji };
  if (mood === "festive") return { label: "Festive", emoji: "🎉" };
  return { label: mood || "Mood", emoji: "💭" };
}

function weatherBorderClass(condition: WeatherCondition): string {
  const map: Record<WeatherCondition, string> = {
    sunny: "border-l-amber-400",
    cloudy: "border-l-slate-400",
    rainy: "border-l-blue-500",
    snowy: "border-l-slate-100 shadow-[inset_4px_0_0_0_rgb(226,232,240)]",
    windy: "border-l-cyan-400",
    stormy: "border-l-violet-500",
    foggy: "border-l-slate-300",
  };
  return map[condition];
}

function buildWeatherData(
  condition: WeatherCondition,
  temp: number
): WeatherData {
  return {
    temp,
    feelsLike: temp - 1,
    condition,
    description: `${condition} conditions`,
    humidity: 50,
    windSpeed: 10,
    icon: "02d",
    high: temp + 3,
    low: temp - 3,
  };
}

function buildOutfitFromSuggestion(
  name: string,
  occasion: string | undefined,
  items: ReturnType<typeof suggestOutfit>
): Outfit {
  const styleSet = new Set<StyleTag>();
  items.forEach((i) => i.style.forEach((s) => styleSet.add(s)));
  const style = Array.from(styleSet).slice(0, 4);
  return {
    id: generateId(),
    name,
    items: items.map((i) => i.id),
    style: style.length ? style : (["casual"] as StyleTag[]),
    occasion: occasion || undefined,
  };
}

function MemoriesSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="h-10 w-72 animate-pulse rounded-lg bg-surface-alt" />
      <div className="h-12 animate-pulse rounded-xl bg-surface-alt" />
      <div className="space-y-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-surface-alt" />
        ))}
      </div>
    </div>
  );
}

export default function MemoriesPage() {
  const [mounted, setMounted] = useState(false);
  const hydrated = useStore((s) => s.hydrated);
  const memories = useStore((s) => s.memories);
  const removeMemory = useStore((s) => s.removeMemory);
  const addMemory = useStore((s) => s.addMemory);
  const wardrobe = useStore((s) => s.wardrobe);
  const temperatureUnit = useStore((s) => s.user.temperatureUnit);

  const [locationQuery, setLocationQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [weatherFilter, setWeatherFilter] = useState<WeatherCondition | "all">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const [modalOpen, setModalOpen] = useState(false);
  const [formDate, setFormDate] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formCondition, setFormCondition] = useState<WeatherCondition>("sunny");
  const [formTemp, setFormTemp] = useState("20");
  const [formOutfitName, setFormOutfitName] = useState("");
  const [formOccasion, setFormOccasion] = useState("");
  const [formMood, setFormMood] = useState<string>("happy");
  const [formNotes, setFormNotes] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyHint, setHistoryHint] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (modalOpen && !formDate) {
      setFormDate(new Date().toISOString().split("T")[0]);
    }
  }, [modalOpen, formDate]);

  const filteredMemories = useMemo(() => {
    let list = [...memories];
    const q = locationQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((m) => m.location.toLowerCase().includes(q));
    }
    if (weatherFilter !== "all") {
      list = list.filter((m) => m.weather.condition === weatherFilter);
    }
    if (dateFrom) {
      const from = startOfDay(parseISO(dateFrom));
      list = list.filter((m) => !isBefore(startOfDay(parseISO(m.date)), from));
    }
    if (dateTo) {
      const to = startOfDay(parseISO(dateTo));
      list = list.filter((m) => !isAfter(startOfDay(parseISO(m.date)), to));
    }
    list.sort((a, b) => {
      const ta = new Date(a.date).getTime();
      const tb = new Date(b.date).getTime();
      return sortOrder === "newest" ? tb - ta : ta - tb;
    });
    return list;
  }, [memories, locationQuery, dateFrom, dateTo, weatherFilter, sortOrder]);

  const resetForm = () => {
    setFormLocation("");
    setFormCondition("sunny");
    setFormTemp("20");
    setFormOutfitName("");
    setFormOccasion("");
    setFormMood("happy");
    setFormNotes("");
    setFormDate(new Date().toISOString().split("T")[0]);
  };

  const loadHistoricalWeather = async () => {
    if (!formLocation.trim() || !formDate) {
      setHistoryHint("Enter location and date first.");
      return;
    }
    setHistoryLoading(true);
    setHistoryHint(null);
    try {
      const w = await getHistoricalWeather(formLocation.trim(), formDate);
      if (!w) {
        setHistoryHint("No historical data found for that place.");
        return;
      }
      setFormCondition(w.condition);
      setFormTemp(String(Math.round(w.temp)));
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmitMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    const temp = Number.parseFloat(formTemp);
    if (Number.isNaN(temp) || !formLocation.trim() || !formOutfitName.trim() || !formDate) {
      return;
    }
    const weather = buildWeatherData(formCondition, temp);
    const suggested = wardrobe.length ? suggestOutfit(wardrobe, weather) : [];
    const outfit = buildOutfitFromSuggestion(
      formOutfitName.trim(),
      formOccasion.trim() || undefined,
      suggested
    );
    await addMemory({
      outfit,
      location: formLocation.trim(),
      weather,
      date: formDate,
      mood: formMood,
      notes: formNotes.trim() || undefined,
    });
    setModalOpen(false);
    resetForm();
  };

  if (!mounted || !hydrated) {
    return <MemoriesSkeleton />;
  }

  return (
    <div className="mx-auto max-w-5xl pb-12">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          Outfit Memory
        </h1>
        <p className="mt-2 text-text-secondary">Your style journey, remembered</p>
      </motion.header>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass flex flex-1 flex-wrap items-center gap-3 rounded-2xl border border-border p-4"
        >
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              placeholder="Search location..."
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CalendarRange className="h-4 w-4 text-text-muted" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <span className="text-text-muted">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-text-muted" />
            <select
              value={weatherFilter}
              onChange={(e) =>
                setWeatherFilter(e.target.value as WeatherCondition | "all")
              }
              className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All weather</option>
              {WEATHER_CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </motion.div>
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.08 }}
          onClick={() => setModalOpen(true)}
          className="gradient-bg inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          Add Memory
        </motion.button>
      </div>

      {filteredMemories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center"
        >
          <ImageIcon className="mb-4 h-14 w-14 text-text-muted" />
          <p className="text-lg font-medium text-text-primary">No memories yet</p>
          <p className="mt-2 max-w-md text-text-secondary">
            Capture outfits with weather and place — your timeline starts with your first memory.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="gradient-bg mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            Add your first memory
          </button>
        </motion.div>
      ) : (
        <div className="relative">
          <div className="absolute bottom-0 left-4 top-0 w-px bg-border md:left-1/2 md:-translate-x-px" />
          <motion.ul
            className="space-y-10 md:space-y-14"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: 0.08 },
              },
            }}
          >
            {filteredMemories.map((memory, index) => {
              const md = moodDisplay(memory.mood);
              const isLeft = index % 2 === 0;
              return (
                <motion.li
                  key={memory.id}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    show: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <div
                    className="absolute left-4 top-8 z-10 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-primary bg-surface shadow-sm md:left-1/2"
                  />
                  <div
                    className={cn(
                      "pl-10 md:flex md:w-full md:pl-0",
                      isLeft ? "md:justify-end md:pr-[calc(50%+1rem)]" : "md:justify-start md:pl-[calc(50%+1rem)]"
                    )}
                  >
                    <div
                      className={cn(
                        "card-hover glass relative w-full max-w-lg rounded-2xl border border-border p-5 shadow-sm md:max-w-md",
                        "border-l-4",
                        weatherBorderClass(memory.weather.condition)
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                            <span className="font-medium text-text-primary">
                              {formatDate(memory.date)}
                            </span>
                            <span className="text-text-muted">·</span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span className="line-clamp-2">{memory.location}</span>
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="text-2xl" aria-hidden>
                              {getWeatherEmoji(memory.weather.condition)}
                            </span>
                            <span className="text-lg font-semibold tabular-nums text-text-primary">
                              {formatTemp(memory.weather.temp, temperatureUnit)}
                            </span>
                            <span className="capitalize text-text-secondary">
                              {memory.weather.condition}
                            </span>
                          </div>
                          <h3 className="mt-3 text-lg font-semibold text-text-primary">
                            {memory.outfit.name}
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {memory.outfit.style.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium capitalize text-primary"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          {memory.mood && (
                            <p className="mt-3 text-sm text-text-secondary">
                              <span className="mr-1.5" aria-hidden>
                                {md.emoji}
                              </span>
                              {md.label}
                            </p>
                          )}
                          {memory.notes && (
                            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                              {memory.notes}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMemory(memory.id)}
                          className="rounded-lg p-2 text-text-muted transition hover:bg-danger/10 hover:text-danger"
                          aria-label="Delete memory"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="memory-modal-title"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.25 }}
              className="glass max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 id="memory-modal-title" className="text-xl font-semibold text-text-primary">
                  New memory
                </h2>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg p-2 text-text-muted transition hover:bg-surface-alt hover:text-text-primary"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmitMemory} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="City or place"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-text-secondary">Weather</span>
                    <button
                      type="button"
                      onClick={() => void loadHistoricalWeather()}
                      disabled={historyLoading}
                      className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                    >
                      {historyLoading ? "Loading…" : "Load historical weather"}
                    </button>
                  </div>
                  {historyHint && (
                    <p className="mb-2 text-xs text-text-muted">{historyHint}</p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                        Condition
                      </label>
                      <select
                        value={formCondition}
                        onChange={(e) =>
                          setFormCondition(e.target.value as WeatherCondition)
                        }
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {WEATHER_CONDITIONS.map((c) => (
                          <option key={c} value={c}>
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                        Temp (°C)
                      </label>
                      <input
                        type="number"
                        required
                        step="0.5"
                        value={formTemp}
                        onChange={(e) => setFormTemp(e.target.value)}
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Outfit name
                  </label>
                  <input
                    type="text"
                    required
                    value={formOutfitName}
                    onChange={(e) => setFormOutfitName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Occasion
                  </label>
                  <input
                    type="text"
                    value={formOccasion}
                    onChange={(e) => setFormOccasion(e.target.value)}
                    placeholder="Optional"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Mood
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {MOOD_OPTIONS.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setFormMood(m.value)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition",
                          formMood === m.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-surface text-text-secondary hover:border-primary/30"
                        )}
                      >
                        <span>{m.emoji}</span>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Notes
                  </label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="What made this day special?"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-primary transition hover:bg-surface-alt"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="gradient-bg rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md"
                  >
                    Save memory
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
