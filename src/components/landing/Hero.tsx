"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CloudSun, Thermometer } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background px-4 pb-20 pt-10 sm:px-6 sm:pb-28 sm:pt-14 lg:px-8">
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/25 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-accent/20 blur-3xl animate-float-delayed" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-light/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <motion.div
          className="max-w-xl"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.h1
            variants={item}
            className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]"
          >
            Your AI-Powered
            <br />
            <span className="gradient-text">Style Companion</span>
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-5 text-lg leading-relaxed text-text-secondary sm:text-xl"
          >
            Weather-aware outfit picks, travel-ready packing, and a wardrobe that
            actually works for your life—powered by AI that understands context,
            not just trends.
          </motion.p>
          <motion.div variants={item} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/register"
              className="gradient-bg inline-flex h-12 items-center justify-center rounded-full px-8 text-center text-sm font-semibold text-white shadow-xl shadow-primary/30 transition hover:opacity-95"
            >
              Start Styling
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center justify-center rounded-full border-2 border-border bg-surface px-8 text-sm font-semibold text-text-primary transition hover:border-primary/40 hover:bg-primary/5"
            >
              See How It Works
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] as const }}
        >
          <div className="relative rounded-3xl border border-border/80 bg-surface p-5 shadow-xl shadow-primary/10">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Today&apos;s look
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <CloudSun className="h-3.5 w-3.5" />
                Partly sunny · 72°F
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Casual Friday</p>
                    <p className="mt-1 text-xs text-text-secondary">Light layers · breathable</p>
                  </div>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                    <Thermometer className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="h-16 flex-1 rounded-xl bg-surface-alt ring-1 ring-border" />
                  <div className="h-16 flex-1 rounded-xl bg-text-primary/5 ring-1 ring-border" />
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
                <p className="text-xs font-medium text-text-secondary">Trip: Lisbon</p>
                <p className="mt-1 text-sm font-semibold text-text-primary">5-day capsule</p>
                <div className="mt-3 space-y-2">
                  <div className="h-2 w-full rounded-full bg-primary/15" />
                  <div className="h-2 w-[80%] rounded-full bg-accent/20" />
                  <div className="h-2 w-[60%] rounded-full bg-primary/10" />
                </div>
                <p className="mt-3 text-xs text-text-secondary">Packed for 18–24°C + rain</p>
              </div>
            </div>
            <div className="mt-3 flex gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/[0.04] p-3">
              <div className="h-14 w-14 shrink-0 rounded-xl bg-surface ring-1 ring-border" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-text-primary">Suggested swap</p>
                <p className="mt-0.5 text-xs text-text-secondary">
                  Trade the blazer for a light trench—better for evening breeze.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
