"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Heart,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type {
  ClothingCategory,
  ClothingItem,
  GarmentDetectionSuggestion,
  Season,
  StyleTag,
} from "@/lib/types";
import { cn, getCategoryIcon } from "@/lib/utils";

const CATEGORY_TABS: { id: "all" | ClothingCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "tops", label: "Tops" },
  { id: "bottoms", label: "Bottoms" },
  { id: "dresses", label: "Dresses" },
  { id: "outerwear", label: "Outerwear" },
  { id: "shoes", label: "Shoes" },
  { id: "accessories", label: "Accessories" },
  { id: "activewear", label: "Activewear" },
  { id: "formal", label: "Formal" },
];

const SEASONS: Season[] = ["spring", "summer", "fall", "winter", "all"];

const STYLES: StyleTag[] = [
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

type SortKey = "newest" | "mostWorn" | "favorites";

function WardrobeSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-surface-alt" />
        <div className="h-11 w-32 animate-pulse rounded-xl bg-surface-alt" />
      </div>
      <div className="h-12 animate-pulse rounded-xl bg-surface-alt" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-56 animate-pulse rounded-xl bg-surface-alt" />
        ))}
      </div>
    </div>
  );
}

function ClothingCard({
  item,
  onToggleFavorite,
}: {
  item: ClothingItem;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      className="card-hover flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
    >
      <div
        className="h-3 w-full shrink-0"
        style={{ backgroundColor: item.colorHex }}
      />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-semibold text-text-primary">{item.name}</h3>
          <button
            type="button"
            onClick={() => onToggleFavorite(item.id)}
            className="shrink-0 rounded-full p-1.5 text-text-muted transition hover:bg-surface-alt hover:text-danger"
            aria-label={item.favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={cn("h-5 w-5", item.favorite && "fill-danger text-danger")}
            />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-alt px-2.5 py-0.5 text-xs font-medium capitalize text-text-secondary">
            <span>{getCategoryIcon(item.category)}</span>
            {item.category}
          </span>
          <span className="text-sm text-text-secondary">{item.color}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {item.season.map((s) => (
            <span
              key={s}
              className="rounded-md bg-primary/10 px-2 py-0.5 text-xs capitalize text-primary"
            >
              {s}
            </span>
          ))}
        </div>
        {item.photoPlaceLabel && (
          <p className="mt-2 flex items-start gap-1 text-xs text-text-muted">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
            <span className="line-clamp-2">
              {item.photoPlaceLabel}
              {item.photoCapturedAt ? ` · ${item.photoCapturedAt}` : ""}
            </span>
          </p>
        )}
        <p className="mt-auto text-xs text-text-muted">Worn {item.wearCount} times</p>
      </div>
    </motion.article>
  );
}

const defaultForm = {
  name: "",
  category: "tops" as ClothingCategory,
  color: "",
  colorHex: "#6C63FF",
  seasons: [] as Season[],
  styles: [] as StyleTag[],
  warmthLevel: 3,
  waterproof: false,
  imageUrl: "/items/placeholder.jpg",
  photoCapturedAt: "",
  photoPlaceLabel: "",
  photoLat: undefined as number | undefined,
  photoLng: undefined as number | undefined,
};

export default function WardrobePage() {
  const [mounted, setMounted] = useState(false);
  const hydrated = useStore((s) => s.hydrated);
  const wardrobe = useStore((s) => s.wardrobe);
  const addClothingItem = useStore((s) => s.addClothingItem);
  const toggleFavorite = useStore((s) => s.toggleFavorite);

  const [categoryFilter, setCategoryFilter] = useState<"all" | ClothingCategory>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiProviderLabel, setAiProviderLabel] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredSorted = useMemo(() => {
    let list = [...wardrobe];
    if (categoryFilter !== "all") {
      list = list.filter((i) => i.category === categoryFilter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }
    if (sort === "newest") {
      list.sort((a, b) => (a.dateAdded < b.dateAdded ? 1 : -1));
    } else if (sort === "mostWorn") {
      list.sort((a, b) => b.wearCount - a.wearCount);
    } else {
      list.sort((a, b) => {
        if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
        return a.dateAdded < b.dateAdded ? 1 : -1;
      });
    }
    return list;
  }, [wardrobe, categoryFilter, search, sort]);

  const openModal = () => {
    setForm(defaultForm);
    setAiError(null);
    setAiProviderLabel(null);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const toggleSeason = (s: Season) => {
    setForm((f) => ({
      ...f,
      seasons: f.seasons.includes(s)
        ? f.seasons.filter((x) => x !== s)
        : [...f.seasons, s],
    }));
  };

  const toggleStyle = (t: StyleTag) => {
    setForm((f) => ({
      ...f,
      styles: f.styles.includes(t) ? f.styles.filter((x) => x !== t) : [...f.styles, t],
    }));
  };

  const applyGarmentSuggestion = (s: GarmentDetectionSuggestion) => {
    setForm((f) => ({
      ...f,
      name: s.name,
      category: s.category,
      color: s.color,
      colorHex: s.colorHex,
      warmthLevel: s.warmthLevel,
      waterproof: s.waterproof,
      seasons: s.season,
      styles: s.style,
    }));
  };

  const runGarmentDetection = async () => {
    if (form.imageUrl === "/items/placeholder.jpg") return;
    setAiLoading(true);
    setAiError(null);
    setAiProviderLabel(null);
    try {
      const res = await fetch("/api/analyze/garment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ imageUrl: form.imageUrl }),
      });
      const data = (await res.json()) as {
        error?: string;
        code?: string;
        suggestion?: GarmentDetectionSuggestion;
        provider?: "gemini" | "openai";
      };
      if (!res.ok || !data.suggestion) {
        setAiError(data.error ?? "Could not analyze this image.");
        return;
      }
      applyGarmentSuggestion(data.suggestion);
      setAiProviderLabel(
        data.provider === "gemini"
          ? "Google Gemini"
          : data.provider === "openai"
            ? "OpenAI"
            : null
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        url?: string;
        exif?: {
          dateIso?: string;
          latitude?: number;
          longitude?: number;
          placeLabel?: string | null;
        };
      };
      if (data.url) {
        setForm((f) => ({
          ...f,
          imageUrl: data.url!,
          ...(data.exif?.dateIso && {
            photoCapturedAt: data.exif.dateIso.slice(0, 10),
          }),
          ...(data.exif?.latitude != null && data.exif?.longitude != null
            ? { photoLat: data.exif.latitude, photoLng: data.exif.longitude }
            : {}),
          ...(data.exif?.placeLabel
            ? { photoPlaceLabel: data.exif.placeLabel }
            : {}),
        }));
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.color.trim()) return;
    if (form.seasons.length === 0 || form.styles.length === 0) return;
    await addClothingItem({
      name: form.name.trim(),
      category: form.category,
      color: form.color.trim(),
      colorHex: form.colorHex,
      season: form.seasons,
      style: form.styles,
      imageUrl: form.imageUrl,
      warmthLevel: form.warmthLevel,
      waterproof: form.waterproof,
      favorite: false,
      ...(form.photoCapturedAt.trim() && {
        photoCapturedAt: form.photoCapturedAt.trim(),
      }),
      ...(form.photoPlaceLabel.trim() && {
        photoPlaceLabel: form.photoPlaceLabel.trim(),
      }),
      ...(form.photoLat != null && form.photoLng != null
        ? { photoLat: form.photoLat, photoLng: form.photoLng }
        : {}),
    });
    closeModal();
    setForm(defaultForm);
  };

  if (!mounted || !hydrated) {
    return <WardrobeSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
              My Wardrobe
            </h1>
            <p className="mt-1 text-text-secondary">
              {filteredSorted.length} item{filteredSorted.length === 1 ? "" : "s"}
              {wardrobe.length !== filteredSorted.length && (
                <span className="text-text-muted">
                  {" "}
                  ({wardrobe.length} total)
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={openModal}
            className="gradient-bg inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-4"
        >
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
                  categoryFilter === tab.id
                    ? "border-primary bg-primary text-white shadow-sm"
                    : "border-border bg-surface text-text-secondary hover:border-primary/30 hover:bg-surface-alt"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name..."
                className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="relative sm:w-48">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="w-full appearance-none rounded-xl border border-border bg-surface py-2.5 pl-10 pr-10 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="newest">Newest</option>
                <option value="mostWorn">Most worn</option>
                <option value="favorites">Favorites</option>
              </select>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="popLayout">
          {filteredSorted.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface py-16 text-center"
            >
              <p className="text-lg font-medium text-text-primary">No items match</p>
              <p className="mt-2 max-w-sm text-sm text-text-secondary">
                Adjust filters or add a new piece to grow your wardrobe.
              </p>
              <button
                type="button"
                onClick={openModal}
                className="gradient-bg mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredSorted.map((item) => (
                  <ClothingCard
                    key={item.id}
                    item={item}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeModal}
              aria-label="Close modal"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="relative z-10 max-h-[min(90vh,800px)] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-text-primary">Add clothing item</h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full p-2 text-text-muted transition hover:bg-surface-alt hover:text-text-primary"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Name
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value as ClothingCategory }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {CATEGORY_TABS.filter((t) => t.id !== "all").map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                      Color name
                    </label>
                    <input
                      required
                      value={form.color}
                      onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                      Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={form.colorHex}
                        onChange={(e) => setForm((f) => ({ ...f, colorHex: e.target.value }))}
                        className="h-11 w-14 cursor-pointer rounded-lg border border-border bg-background p-1"
                      />
                      <span className="font-mono text-sm text-text-secondary">{form.colorHex}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-text-secondary">Seasons</p>
                  <div className="flex flex-wrap gap-2">
                    {SEASONS.map((s) => (
                      <label
                        key={s}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
                          form.seasons.includes(s)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-surface-alt text-text-secondary hover:border-primary/40"
                        )}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={form.seasons.includes(s)}
                          onChange={() => toggleSeason(s)}
                        />
                        <span className="capitalize">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-text-secondary">Styles</p>
                  <div className="flex flex-wrap gap-2">
                    {STYLES.map((t) => (
                      <label
                        key={t}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
                          form.styles.includes(t)
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border bg-surface-alt text-text-secondary hover:border-accent/40"
                        )}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={form.styles.includes(t)}
                          onChange={() => toggleStyle(t)}
                        />
                        <span className="capitalize">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-text-secondary">Warmth level</span>
                    <span className="text-sm font-semibold text-text-primary">{form.warmthLevel}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={form.warmthLevel}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, warmthLevel: Number(e.target.value) }))
                    }
                    className="w-full accent-primary"
                  />
                  <div className="mt-1 flex justify-between text-xs text-text-muted">
                    <span>Light</span>
                    <span>Warm</span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border bg-surface-alt px-4 py-3">
                  <span className="text-sm font-medium text-text-secondary">Waterproof</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.waterproof}
                    onClick={() => setForm((f) => ({ ...f, waterproof: !f.waterproof }))}
                    className={cn(
                      "relative h-7 w-12 rounded-full transition",
                      form.waterproof ? "bg-primary" : "bg-border"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition",
                        form.waterproof ? "left-6" : "left-1"
                      )}
                    />
                  </button>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-text-secondary">Image</p>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface-alt py-8 text-center transition hover:border-primary/40">
                    <Upload className="h-10 w-10 text-text-muted" />
                    <p className="mt-2 text-sm text-text-secondary">
                      {uploading ? "Uploading…" : "Click to upload a photo"}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">JPEG / PNG, up to 4MB</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </label>
                  {form.imageUrl && form.imageUrl !== "/items/placeholder.jpg" && (
                    <p className="mt-2 truncate text-xs text-text-muted" title={form.imageUrl}>
                      Image attached
                    </p>
                  )}
                  <div className="mt-4">
                    <button
                      type="button"
                      disabled={
                        uploading ||
                        aiLoading ||
                        form.imageUrl === "/items/placeholder.jpg"
                      }
                      onClick={() => void runGarmentDetection()}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Sparkles className="h-4 w-4 shrink-0" />
                      {aiLoading ? "Analyzing photo…" : "Detect garment with AI"}
                    </button>
                    <p className="mt-2 text-center text-xs text-text-muted">
                      Fills name, category, color, warmth, seasons &amp; styles from the photo. Set{" "}
                      <span className="font-mono">GEMINI_API_KEY</span> (preferred) or{" "}
                      <span className="font-mono">OPENAI_API_KEY</span> on the server.
                    </p>
                    {aiProviderLabel && (
                      <p className="mt-2 text-center text-xs text-primary/90" role="status">
                        Suggestions from {aiProviderLabel}
                      </p>
                    )}
                    {aiError && (
                      <p className="mt-2 text-center text-xs text-danger" role="alert">
                        {aiError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-border/80 bg-surface-alt/50 p-4">
                  <p className="text-sm font-medium text-text-secondary">Photo context (optional)</p>
                  <p className="text-xs text-text-muted">
                    Pre-filled from EXIF and reverse geocoding when your photo includes GPS. You can edit
                    or enter manually.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-text-muted">
                        Photo date
                      </label>
                      <input
                        type="date"
                        value={form.photoCapturedAt}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, photoCapturedAt: e.target.value }))
                        }
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-medium text-text-muted">
                        Place / location label
                      </label>
                      <input
                        type="text"
                        value={form.photoPlaceLabel}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, photoPlaceLabel: e.target.value }))
                        }
                        placeholder="e.g. Paris, France"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-surface-alt"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      !form.name.trim() ||
                      !form.color.trim() ||
                      form.seasons.length === 0 ||
                      form.styles.length === 0
                    }
                    className="gradient-bg flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add to wardrobe
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
