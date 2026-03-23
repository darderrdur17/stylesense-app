"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStore } from "@/lib/store";
import type { StyleTag } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLE_TAGS: StyleTag[] = [
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

const CHART_PALETTE = [
  "#6C63FF",
  "#FF8C42",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
];

function AnalyticsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-surface-alt" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-surface-alt" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[340px] animate-pulse rounded-2xl bg-surface-alt" />
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const hydrated = useStore((s) => s.hydrated);
  const wardrobe = useStore((s) => s.wardrobe);
  const feedbackStats = useStore((s) => s.feedbackStats);

  useEffect(() => {
    setMounted(true);
  }, []);

  const analytics = useMemo(() => {
    const totalItems = wardrobe.length;
    const categories = new Set(wardrobe.map((i) => i.category));
    const categoriesUsed = categories.size;

    const wearByCategory = new Map<string, number>();
    wardrobe.forEach((i) => {
      wearByCategory.set(
        i.category,
        (wearByCategory.get(i.category) ?? 0) + i.wearCount
      );
    });
    let mostWornCategory = "tops";
    let maxWear = 0;
    wearByCategory.forEach((w, cat) => {
      if (w > maxWear) {
        maxWear = w;
        mostWornCategory = cat;
      }
    });
    if (wardrobe.length === 0) {
      mostWornCategory = "tops";
    }

    const favoriteCount = wardrobe.filter((i) => i.favorite).length;

    const categoryData = Array.from(
      wardrobe.reduce((acc, i) => {
        acc.set(i.category, (acc.get(i.category) ?? 0) + 1);
        return acc;
      }, new Map<string, number>())
    ).map(([name, value]) => ({ name, value }));

    const colorData = Array.from(
      wardrobe.reduce((acc, i) => {
        const key = i.color;
        if (!acc.has(key)) {
          acc.set(key, { name: i.color, count: 0, colorHex: i.colorHex });
        }
        const cur = acc.get(key)!;
        cur.count += 1;
        return acc;
      }, new Map<string, { name: string; count: number; colorHex: string }>())
    ).map(([, v]) => ({ name: v.name, count: v.count, colorHex: v.colorHex }));

    const styleRadar = STYLE_TAGS.map((tag) => ({
      tag,
      count: wardrobe.filter((i) => i.style.includes(tag)).length,
    }));

    const seasonKeys = ["spring", "summer", "fall", "winter"] as const;
    const seasonCounts: Record<string, number> = {
      spring: 0,
      summer: 0,
      fall: 0,
      winter: 0,
    };
    wardrobe.forEach((item) => {
      if (item.season.includes("all")) {
        seasonKeys.forEach((s) => {
          seasonCounts[s] += 1;
        });
      } else {
        item.season.forEach((s) => {
          if (s !== "all" && seasonCounts[s] !== undefined) {
            seasonCounts[s] += 1;
          }
        });
      }
    });
    const seasonData = seasonKeys.map((s) => ({
      name: s,
      value: seasonCounts[s],
    }));

    const wearFrequencyData = [...wardrobe]
      .sort((a, b) => b.wearCount - a.wearCount)
      .slice(0, 10)
      .map((i) => ({ name: i.name, wears: i.wearCount }));

    return {
      totalItems,
      categoriesUsed,
      mostWornCategory,
      favoriteCount,
      categoryData,
      colorData,
      styleRadar,
      seasonData,
      wearFrequencyData,
    };
  }, [wardrobe]);

  if (!mounted || !hydrated) {
    return (
      <div className="min-h-[60vh] bg-background">
        <AnalyticsSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10 pb-8">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
            Style Analytics
          </h1>
        </div>
        <p className="mt-2 text-lg text-text-secondary">
          Understand your fashion patterns
        </p>
      </motion.header>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {[
          { label: "Total items", value: analytics.totalItems },
          { label: "Categories used", value: analytics.categoriesUsed },
          {
            label: "Most worn category",
            value:
              analytics.totalItems === 0 ? "—" : analytics.mostWornCategory,
            capitalize: true,
          },
          { label: "Favorites", value: analytics.favoriteCount },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.05 }}
            className="card-hover rounded-2xl border border-border bg-surface p-5 shadow-sm"
          >
            <p className="text-sm text-text-secondary">{card.label}</p>
            <p
              className={cn(
                "mt-2 text-2xl font-bold tabular-nums text-text-primary",
                "capitalize" in card && card.capitalize && "capitalize"
              )}
            >
              {card.value}
            </p>
          </motion.div>
        ))}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.07 }}
        className="grid grid-cols-2 gap-4 lg:grid-cols-2"
      >
        <div className="card-hover rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-text-secondary">Dashboard suggestion feedback</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-text-primary">
            {feedbackStats.total}
          </p>
          <p className="mt-1 text-xs text-text-muted">Total responses (love it / not quite)</p>
        </div>
        <div className="card-hover rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-text-secondary">Positive rate</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-text-primary">
            {feedbackStats.total === 0
              ? "—"
              : `${Math.round((feedbackStats.thumbsUp / feedbackStats.total) * 100)}%`}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {feedbackStats.thumbsUp} love it of {feedbackStats.total}
          </p>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {analytics.categoryData.map((_, index) => (
                  <Cell
                    key={`cat-${index}`}
                    fill={CHART_PALETTE[index % CHART_PALETTE.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Color Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.colorData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {analytics.colorData.map((entry, index) => (
                  <Cell key={`color-${index}`} fill={entry.colorHex} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Style Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={analytics.styleRadar}>
              <PolarGrid className="stroke-border" />
              <PolarAngleAxis dataKey="tag" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis allowDecimals={false} />
              <Radar
                name="Items"
                dataKey="count"
                stroke="#6C63FF"
                fill="#6C63FF"
                fillOpacity={0.35}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Season Coverage
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.seasonData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {analytics.seasonData.map((_, index) => (
                  <Cell
                    key={`season-${index}`}
                    fill={CHART_PALETTE[index % CHART_PALETTE.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Wear Frequency
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={analytics.wearFrequencyData}
              layout="vertical"
              margin={{ left: 8, right: 16 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 11 }}
              />
              <Tooltip />
              <Bar dataKey="wears" fill="#6C63FF" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.section>
    </div>
  );
}
