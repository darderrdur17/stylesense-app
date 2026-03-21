"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "Try the essentials and build your first capsule.",
    features: [
      "20 wardrobe items",
      "Basic outfit suggestions",
      "1 trip plan",
    ],
    cta: "Get Started",
    href: "/app",
    highlighted: false,
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/mo",
    description: "The full wardrobe brain for daily and travel styling.",
    features: [
      "Unlimited wardrobe items",
      "AI style matching",
      "Unlimited trip plans",
      "Style analytics",
    ],
    cta: "Start Pro Trial",
    href: "/app",
    highlighted: true,
    variant: "gradient" as const,
  },
  {
    name: "Premium",
    price: "$19.99",
    period: "/mo",
    description: "Everything in Pro plus premium perks and early access.",
    features: [
      "Everything in Pro",
      "Influencer style matching",
      "Priority support",
      "Early access to new features",
    ],
    cta: "Go Premium",
    href: "/app",
    highlighted: false,
    variant: "soft" as const,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 bg-background px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Pick the plan that fits how you dress. Upgrade or downgrade anytime.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3 lg:items-stretch">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.08, duration: 0.45 }}
              className={
                tier.highlighted
                  ? "relative z-10 lg:-mt-4 lg:scale-[1.03]"
                  : "relative"
              }
            >
              {tier.highlighted ? (
                <div className="rounded-2xl bg-gradient-to-br from-primary to-accent p-[2px] shadow-xl shadow-primary/25">
                  <div className="relative flex h-full flex-col rounded-[14px] bg-surface px-8 pb-10 pt-12">
                    <span className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full gradient-bg px-4 py-1.5 text-xs font-semibold text-white shadow-md">
                      Most Popular
                    </span>
                    <h3 className="text-lg font-semibold text-text-primary">{tier.name}</h3>
                    <p className="mt-2 text-sm text-text-secondary">{tier.description}</p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight text-text-primary">
                        {tier.price}
                      </span>
                      <span className="text-text-secondary">{tier.period}</span>
                    </div>
                    <ul className="mt-8 flex-1 space-y-3">
                      {tier.features.map((f) => (
                        <li key={f} className="flex gap-3 text-sm text-text-primary">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-10">
                      <Link
                        href={tier.href}
                        className="gradient-bg flex w-full items-center justify-center rounded-full py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:opacity-95"
                      >
                        {tier.cta}
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-8 shadow-sm">
                  <h3 className="text-lg font-semibold text-text-primary">{tier.name}</h3>
                  <p className="mt-2 text-sm text-text-secondary">{tier.description}</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight text-text-primary">
                      {tier.price}
                    </span>
                    <span className="text-text-secondary">{tier.period}</span>
                  </div>
                  <ul className="mt-8 flex-1 space-y-3">
                    {tier.features.map((f) => (
                      <li key={f} className="flex gap-3 text-sm text-text-primary">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-10">
                    <Link
                      href={tier.href}
                      className={
                        tier.variant === "outline"
                          ? "flex w-full items-center justify-center rounded-full border-2 border-border bg-surface py-3.5 text-sm font-semibold text-text-primary transition hover:border-primary/40 hover:bg-primary/5"
                          : "flex w-full items-center justify-center rounded-full border-2 border-primary/30 bg-primary/5 py-3.5 text-sm font-semibold text-primary transition hover:bg-primary/10"
                      }
                    >
                      {tier.cta}
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
