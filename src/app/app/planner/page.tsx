"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPin,
  Package,
  Plane,
  Plus,
  Trash2,
} from "lucide-react";
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
} from "date-fns";
import { useStore } from "@/lib/store";
import type { DayPlan, Outfit, TripPlan } from "@/lib/types";
import {
  cn,
  formatDate,
  formatTemp,
  generateId,
  getWeatherEmoji,
  suggestOutfit,
} from "@/lib/utils";
import { getForecast } from "@/lib/weather";

function PlannerSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="h-10 w-80 animate-pulse rounded-lg bg-surface-alt" />
      <div className="h-48 animate-pulse rounded-2xl bg-surface-alt" />
      <div className="h-64 animate-pulse rounded-2xl bg-surface-alt" />
    </div>
  );
}

function parseLocalDateInput(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function nextTripStatus(current: TripPlan["status"]): TripPlan["status"] {
  const order: TripPlan["status"][] = ["planning", "packed", "traveling", "completed"];
  const idx = order.indexOf(current);
  if (idx < 0 || idx >= order.length - 1) return current;
  return order[idx + 1];
}

function statusStyles(status: TripPlan["status"]): string {
  const map: Record<TripPlan["status"], string> = {
    planning: "bg-warning/15 text-warning border-warning/30",
    packed: "bg-primary/15 text-primary border-primary/30",
    traveling: "bg-accent/15 text-accent border-accent/30",
    completed: "bg-success/15 text-success border-success/30",
  };
  return map[status];
}

function buildDayOutfit(
  label: string,
  suggested: ReturnType<typeof suggestOutfit>
): Outfit {
  const styleSet = new Set<string>();
  suggested.forEach((i) => i.style.forEach((s) => styleSet.add(s)));
  const style = Array.from(styleSet).slice(0, 4) as Outfit["style"];
  return {
    id: generateId(),
    name: label,
    items: suggested.map((i) => i.id),
    style: style.length ? style : ["casual"],
  };
}

export default function PlannerPage() {
  const [mounted, setMounted] = useState(false);
  const hydrated = useStore((s) => s.hydrated);
  const wardrobe = useStore((s) => s.wardrobe);
  const trips = useStore((s) => s.trips);
  const addTrip = useStore((s) => s.addTrip);
  const updateTrip = useStore((s) => s.updateTrip);
  const removeTrip = useStore((s) => s.removeTrip);
  const temperatureUnit = useStore((s) => s.user.temperatureUnit);

  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const [draftDestination, setDraftDestination] = useState("");
  const [draftStart, setDraftStart] = useState("");
  const [draftEnd, setDraftEnd] = useState("");
  const [draftDays, setDraftDays] = useState<DayPlan[]>([]);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const itemNameById = useMemo(() => {
    const m = new Map<string, string>();
    wardrobe.forEach((i) => m.set(i.id, i.name));
    return m;
  }, [wardrobe]);

  const resolveItemNames = (ids: string[]) =>
    ids.map((id) => itemNameById.get(id) || id);

  const outfitCountForTrip = (t: TripPlan) =>
    t.dailyOutfits.reduce(
      (n, d) => n + 1 + (d.eveningOutfit ? 1 : 0),
      0
    );

  const handlePlanTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlanError(null);
    if (!destination.trim() || !startDate || !endDate) {
      setPlanError("Fill in destination and dates.");
      return;
    }
    const start = parseLocalDateInput(startDate);
    const end = parseLocalDateInput(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setPlanError("Invalid dates.");
      return;
    }
    if (end < start) {
      setPlanError("End date must be on or after start date.");
      return;
    }
    const numDays = differenceInCalendarDays(end, start) + 1;
    if (wardrobe.length === 0) {
      setPlanError("Add items to your wardrobe before planning a trip.");
      return;
    }

    setLoading(true);
    try {
      const forecast = await getForecast(destination.trim(), numDays);
      const days = eachDayOfInterval({ start, end });
      const dailyOutfits: DayPlan[] = days.map((day, i) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const weather =
          forecast[i] ?? forecast[forecast.length - 1] ?? forecast[0];
        const suggested = suggestOutfit(wardrobe, weather);
        const label = `Day ${i + 1} — ${formatDate(dateStr)}`;
        return {
          date: dateStr,
          weather,
          dayOutfit: buildDayOutfit(label, suggested),
        };
      });
      setDraftDestination(destination.trim());
      setDraftStart(startDate);
      setDraftEnd(endDate);
      setDraftDays(dailyOutfits);
    } catch {
      setPlanError("Could not load forecast. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (draftDays.length === 0) return;
    const packingSet = new Set<string>();
    draftDays.forEach((d) => {
      d.dayOutfit.items.forEach((id) => packingSet.add(id));
      d.eveningOutfit?.items.forEach((id) => packingSet.add(id));
    });
    await addTrip({
      destination: draftDestination,
      startDate: draftStart,
      endDate: draftEnd,
      dailyOutfits: draftDays,
      packingList: Array.from(packingSet),
      status: "planning",
    });
    setDraftDays([]);
    setDraftDestination("");
    setDraftStart("");
    setDraftEnd("");
  };

  if (!mounted || !hydrated) {
    return <PlannerSkeleton />;
  }

  return (
    <div className="mx-auto max-w-5xl pb-12">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
      >
        <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          Travel Planner
        </h1>
        <p className="mt-2 text-text-secondary">Pack perfectly for every trip</p>
      </motion.header>

      <div className="grid gap-10 lg:grid-cols-1">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-text-primary">
            <Plane className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Plan a New Trip</h2>
          </div>
          <form
            onSubmit={handlePlanTrip}
            className="glass rounded-2xl border border-border p-6 shadow-sm"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                  Destination
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="City or region"
                    className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                  Start date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                  End date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            {planError && (
              <p className="mt-3 text-sm text-danger">{planError}</p>
            )}
            {wardrobe.length === 0 && (
              <p className="mt-4 rounded-xl border border-dashed border-warning/40 bg-warning/5 px-4 py-3 text-sm text-text-secondary">
                Your wardrobe is empty. Add clothing in My Wardrobe so we can suggest outfits for each day.
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={loading || wardrobe.length === 0}
                className="gradient-bg inline-flex min-w-[200px] items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Planning…
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    Get Forecast & Plan
                  </>
                )}
              </button>
            </div>
          </form>

          <AnimatePresence>
            {draftDays.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-text-primary">
                      Preview — {draftDestination}
                    </h3>
                    <button
                      type="button"
                      onClick={handleSaveTrip}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary shadow-sm transition hover:border-primary/40 hover:bg-surface-alt"
                    >
                      <Plus className="h-4 w-4" />
                      Save Trip
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {draftDays.map((day, idx) => (
                      <motion.div
                        key={`${day.date}-${idx}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="card-hover glass rounded-2xl border border-border p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                              {formatDate(day.date)}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-2xl" aria-hidden>
                                {getWeatherEmoji(day.weather.condition)}
                              </span>
                              <span className="text-lg font-semibold tabular-nums text-text-primary">
                                {formatTemp(day.weather.temp, temperatureUnit)}
                              </span>
                              <span className="text-sm capitalize text-text-secondary">
                                {day.weather.condition}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 text-sm font-medium text-text-primary">
                          {day.dayOutfit.name}
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                          {resolveItemNames(day.dayOutfit.items).map((name, i) => (
                            <li key={`${day.date}-${i}`} className="flex gap-2">
                              <Package className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" />
                              <span>{name}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-text-primary">
            <Package className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold">Your Trips</h2>
          </div>
          {trips.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center text-text-secondary">
              No saved trips yet. Plan a trip above and save it when you are happy with the forecast and outfits.
            </div>
          ) : (
            <ul className="space-y-4">
              {trips.map((trip, tIdx) => {
                const expanded = expandedId === trip.id;
                return (
                  <motion.li
                    key={trip.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * tIdx }}
                    className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
                  >
                    <div className="flex w-full flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(expanded ? null : trip.id)
                        }
                        className="flex min-w-0 flex-1 items-start gap-3 text-left transition hover:opacity-90"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-lg font-semibold text-text-primary">
                              {trip.destination}
                            </h3>
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
                                statusStyles(trip.status)
                              )}
                            >
                              {trip.status}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-text-secondary">
                            {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                          </p>
                          <p className="mt-2 text-sm text-text-muted">
                            {outfitCountForTrip(trip)} outfit
                            {outfitCountForTrip(trip) === 1 ? "" : "s"} planned
                          </p>
                        </div>
                        <span className="shrink-0 text-text-muted" aria-hidden>
                          {expanded ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </span>
                      </button>
                      <div className="flex shrink-0 items-center justify-end gap-2 sm:pt-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            updateTrip(trip.id, {
                              status: nextTripStatus(trip.status),
                            })
                          }
                          disabled={trip.status === "completed"}
                          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-primary transition hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Next status
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            removeTrip(trip.id);
                            if (expandedId === trip.id) setExpandedId(null);
                          }}
                          className="rounded-lg p-2 text-text-muted transition hover:bg-danger/10 hover:text-danger"
                          aria-label="Delete trip"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border bg-background/60"
                        >
                          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                            {trip.dailyOutfits.map((day, dIdx) => (
                              <div
                                key={`${trip.id}-${day.date}-${dIdx}`}
                                className="rounded-xl border border-border bg-surface p-4"
                              >
                                <p className="text-xs font-medium uppercase text-text-muted">
                                  {formatDate(day.date)}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-xl" aria-hidden>
                                    {getWeatherEmoji(day.weather.condition)}
                                  </span>
                                  <span className="font-semibold tabular-nums text-text-primary">
                                    {formatTemp(day.weather.temp, temperatureUnit)}
                                  </span>
                                  <span className="text-sm capitalize text-text-secondary">
                                    {day.weather.condition}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm font-medium text-text-primary">
                                  {day.dayOutfit.name}
                                </p>
                                <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                                  {resolveItemNames(day.dayOutfit.items).map(
                                    (name, i) => (
                                      <li key={`${day.date}-item-${i}`}>{name}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </motion.section>
      </div>
    </div>
  );
}
