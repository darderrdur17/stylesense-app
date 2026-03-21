"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import type { ClothingItem, StyleInspo, StyleTag } from "@/lib/types";
import { cn, getCategoryIcon, matchScore } from "@/lib/utils";

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

const TAG_GRADIENT: Record<StyleTag, string> = {
  casual: "linear-gradient(135deg, #6C63FF 0%, #8B85FF 100%)",
  formal: "linear-gradient(135deg, #1B2A4A 0%, #4A5568 100%)",
  athletic: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
  streetwear: "linear-gradient(135deg, #1A1B2E 0%, #6C63FF 100%)",
  bohemian: "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)",
  minimalist: "linear-gradient(135deg, #9CA3AF 0%, #E5E7EB 100%)",
  vintage: "linear-gradient(135deg, #92400E 0%, #D97706 100%)",
  preppy: "linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)",
  elegant: "linear-gradient(135deg, #7C3AED 0%, #C084FC 100%)",
};

const TAG_ACCENT: Record<StyleTag, string> = {
  casual: "#6C63FF",
  formal: "#1B2A4A",
  athletic: "#10B981",
  streetwear: "#6C63FF",
  bohemian: "#D97706",
  minimalist: "#9CA3AF",
  vintage: "#92400E",
  preppy: "#2563EB",
  elegant: "#7C3AED",
};

function headerGradientForTags(tags: StyleTag[]): string {
  if (tags.length === 0) return TAG_GRADIENT.casual;
  if (tags.length === 1) return TAG_GRADIENT[tags[0]];
  const a = tags[0];
  const b = tags[1] ?? tags[0];
  return `linear-gradient(135deg, ${TAG_ACCENT[a]}, ${TAG_ACCENT[b]})`;
}

function CircularProgress({ value, size = 56 }: { value: number; size?: number }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const offset = c * (1 - pct / 100);
  const cx = size / 2;
  const cy = size / 2;
  return (
    <svg
      width={size}
      height={size}
      className="shrink-0 -rotate-90"
      aria-hidden
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        className="stroke-border"
        strokeWidth={stroke}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        className="stroke-primary"
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}

function StyleMatchSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <div className="h-10 w-72 animate-pulse rounded-lg bg-surface-alt" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-72 animate-pulse rounded-2xl bg-surface-alt" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-surface-alt" />
    </div>
  );
}

function resolveMatchedNames(
  ids: string[] | undefined,
  wardrobe: ClothingItem[]
): { id: string; name: string }[] {
  if (!ids?.length) return [];
  const map = new Map(wardrobe.map((w) => [w.id, w.name]));
  return ids.map((id) => ({
    id,
    name: map.get(id) ?? "Unknown item",
  }));
}

function InspoCard({
  inspo,
  wardrobe,
  expanded,
  onToggle,
  index,
}: {
  inspo: StyleInspo;
  wardrobe: ClothingItem[];
  expanded: boolean;
  onToggle: () => void;
  index: number;
}) {
  const score = inspo.matchScore ?? 0;
  const matched = resolveMatchedNames(inspo.matchedItems, wardrobe);
  const gradient = headerGradientForTags(inspo.tags);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="card-hover flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
    >
      <div
        className="relative h-28 shrink-0"
        style={{ background: gradient }}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex h-full items-end justify-between gap-3 p-4">
          <h3 className="text-lg font-semibold text-white drop-shadow-sm">
            {inspo.name}
          </h3>
          <div className="relative flex h-14 w-14 items-center justify-center">
            <CircularProgress value={score} size={56} />
            <span className="absolute text-xs font-bold tabular-nums text-text-primary">
              {score}%
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          {inspo.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-surface-alt px-2.5 py-0.5 text-xs font-medium capitalize text-text-secondary"
            >
              {t}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="gradient-bg mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Hide Match
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              View Match
            </>
          )}
        </button>
        {expanded && matched.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-2 border-t border-border pt-3"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Matched wardrobe
            </p>
            <ul className="space-y-2">
              {matched.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-2 rounded-lg bg-surface-alt px-3 py-2 text-sm text-text-primary"
                >
                  <span className="text-base" aria-hidden>
                    {getCategoryIcon(
                      wardrobe.find((w) => w.id === m.id)?.category ?? "tops"
                    )}
                  </span>
                  <span className="line-clamp-1 font-medium">{m.name}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </motion.article>
  );
}

export default function StyleMatchPage() {
  const [mounted, setMounted] = useState(false);
  const inspirations = useStore((s) => s.inspirations);
  const wardrobe = useStore((s) => s.wardrobe);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<StyleTag[]>([]);
  const [vibeResults, setVibeResults] = useState<
    { item: ClothingItem; score: number }[]
  >([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTag = (tag: StyleTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleFindMatches = () => {
    if (selectedTags.length === 0) {
      setVibeResults([]);
      return;
    }
    const scored = wardrobe.map((item) => ({
      item,
      score: matchScore(item.style, selectedTags),
    }));
    scored.sort((a, b) => b.score - a.score);
    setVibeResults(scored);
  };

  if (!mounted) {
    return (
      <div className="min-h-[60vh] bg-background">
        <StyleMatchSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-12 pb-8">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
            Style Match
          </h1>
        </div>
        <p className="mt-2 text-lg text-text-secondary">
          Find your style inspiration
        </p>
      </motion.header>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
      >
        <h2 className="mb-6 text-xl font-semibold text-text-primary">
          Style Inspirations
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {inspirations.map((inspo, i) => (
            <InspoCard
              key={inspo.id}
              inspo={inspo}
              wardrobe={wardrobe}
              index={i}
              expanded={expandedId === inspo.id}
              onToggle={() =>
                setExpandedId((id) => (id === inspo.id ? null : inspo.id))
              }
            />
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-8"
      >
        <h2 className="text-xl font-semibold text-text-primary">
          Create Your Own Vibe
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Pick tags to score pieces in your wardrobe.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {ALL_STYLE_TAGS.map((tag) => {
            const active = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium capitalize transition",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface-alt text-text-secondary hover:border-primary/30"
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={handleFindMatches}
          className="gradient-bg mt-6 rounded-xl px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
        >
          Find Matches
        </button>

        {vibeResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-3"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Results
            </h3>
            <ul className="space-y-2">
              {vibeResults.map(({ item, score }, idx) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="glass flex items-center justify-between gap-4 rounded-xl border border-border p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-xl">{getCategoryIcon(item.category)}</span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-text-primary">
                        {item.name}
                      </p>
                      <p className="text-xs capitalize text-text-muted">
                        {item.category}
                      </p>
                    </div>
                  </div>
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                    <CircularProgress value={score} size={48} />
                    <span className="absolute text-[10px] font-bold tabular-nums text-text-primary">
                      {score}%
                    </span>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
        {selectedTags.length === 0 && vibeResults.length === 0 && (
          <p className="mt-6 text-sm text-text-muted">
            Select at least one style tag, then tap Find Matches.
          </p>
        )}
      </motion.section>
    </div>
  );
}
