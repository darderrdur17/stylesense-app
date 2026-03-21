"use client";

import { motion } from "framer-motion";
import {
  CloudSun,
  Heart,
  MapPin,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";

const showcaseCards = [
  {
    label: "AI Suggestion",
    title: "Based on your Tokyo outfit",
    subtitle: "Light layers for 22°C with afternoon showers",
    icon: Sparkles,
    items: [
      { name: "Linen Shirt", color: "#E8DCC8" },
      { name: "Slim Chinos", color: "#556B2F" },
      { name: "Rain Jacket", color: "#2C2C2C" },
    ],
    accent: "from-primary to-primary-light",
  },
  {
    label: "Travel Pack",
    title: "Milan · 4 days",
    subtitle: "18–23°C, mix of sun & rain",
    icon: MapPin,
    days: [
      { day: "Day 1", weather: "☀️", temp: "21°C" },
      { day: "Day 2", weather: "☁️", temp: "19°C" },
      { day: "Day 3", weather: "☀️", temp: "23°C" },
      { day: "Day 4", weather: "🌧️", temp: "17°C" },
    ],
    accent: "from-accent to-accent-light",
  },
  {
    label: "Style Match",
    title: "Minimalist Chic",
    subtitle: "87% match with your wardrobe",
    icon: Heart,
    score: 87,
    accent: "from-primary to-accent",
  },
];

export function Showcase() {
  return (
    <section className="bg-surface px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            See StyleSense <span className="gradient-text">in Action</span>
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Real scenarios, real outfits. Here's what your AI stylist does for
            you every day.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <motion.div
            className="card-hover rounded-2xl border border-border bg-background p-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-text-muted">
                  {showcaseCards[0].label}
                </p>
                <p className="text-sm font-semibold text-text-primary">
                  {showcaseCards[0].title}
                </p>
              </div>
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
              <CloudSun className="h-3.5 w-3.5" />
              {showcaseCards[0].subtitle}
            </p>
            <div className="mt-4 space-y-2">
              {showcaseCards[0].items!.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-3 rounded-xl bg-surface p-3"
                >
                  <div
                    className="h-10 w-10 rounded-lg"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-text-primary">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-full bg-primary/10 py-2 text-xs font-semibold text-primary">
                Accept
              </button>
              <button className="flex-1 rounded-full border border-border py-2 text-xs font-semibold text-text-secondary">
                Swap
              </button>
            </div>
          </motion.div>

          <motion.div
            className="card-hover rounded-2xl border border-border bg-background p-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-light text-white">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-text-muted">
                  {showcaseCards[1].label}
                </p>
                <p className="text-sm font-semibold text-text-primary">
                  {showcaseCards[1].title}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-text-secondary">
              {showcaseCards[1].subtitle}
            </p>
            <div className="mt-4 space-y-2">
              {showcaseCards[1].days!.map((d) => (
                <div
                  key={d.day}
                  className="flex items-center justify-between rounded-xl bg-surface px-4 py-3"
                >
                  <span className="text-sm font-medium text-text-primary">
                    {d.day}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-base">{d.weather}</span>
                    <span className="text-sm font-medium text-text-secondary">
                      {d.temp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full rounded-full bg-accent/10 py-2 text-xs font-semibold text-accent">
              View Packing List
            </button>
          </motion.div>

          <motion.div
            className="card-hover rounded-2xl border border-border bg-background p-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.16 }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-text-muted">
                  {showcaseCards[2].label}
                </p>
                <p className="text-sm font-semibold text-text-primary">
                  {showcaseCards[2].title}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-text-secondary">
              {showcaseCards[2].subtitle}
            </p>

            <div className="mt-6 flex flex-col items-center">
              <div className="relative h-32 w-32">
                <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="url(#showcase-grad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(87 / 100) * 327} 327`}
                  />
                  <defs>
                    <linearGradient
                      id="showcase-grad"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#6C63FF" />
                      <stop offset="100%" stopColor="#FF8C42" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-text-primary">
                    87%
                  </span>
                  <span className="text-xs text-text-muted">match</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-4 w-4 ${s <= 4 ? "fill-accent text-accent" : "text-border"}`}
                />
              ))}
              <span className="ml-2 text-xs text-text-secondary">
                Style Score
              </span>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {["minimalist", "elegant", "casual"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          {[
            { value: "10K+", label: "Outfits Planned" },
            { value: "95%", label: "User Satisfaction" },
            { value: "50+", label: "Cities Covered" },
            { value: "78%", label: "Outfit Acceptance" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-2xl border border-border bg-background p-6 text-center"
            >
              <span className="gradient-text text-3xl font-bold">
                {stat.value}
              </span>
              <span className="mt-1 text-sm text-text-secondary">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
