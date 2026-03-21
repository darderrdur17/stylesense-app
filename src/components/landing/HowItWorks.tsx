"use client";

import { motion } from "framer-motion";
import { CalendarRange, Sparkles, Upload } from "lucide-react";

const steps = [
  {
    n: "01",
    title: "Upload Your Wardrobe",
    description: "Snap photos or upload images of your clothes to build your digital closet.",
    icon: Upload,
  },
  {
    n: "02",
    title: "Tell Us Your Plans",
    description: "Set your destination, dates, and style preferences in seconds.",
    icon: CalendarRange,
  },
  {
    n: "03",
    title: "Get AI-Powered Outfits",
    description: "Receive personalized outfit suggestions tailored to weather and context.",
    icon: Sparkles,
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 bg-surface px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            How StyleSense Works
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Three simple steps from closet photos to confident outfits.
          </p>
        </motion.div>

        <div className="relative mt-16">
          <div className="absolute left-[1.375rem] top-8 bottom-8 w-px bg-gradient-to-b from-primary/45 via-border to-accent/45 md:hidden" />

          <div className="pointer-events-none absolute left-[10%] right-[10%] top-[3.25rem] hidden h-px bg-gradient-to-r from-primary/30 via-border to-accent/30 md:block" />

          <div className="flex flex-col gap-12 md:flex-row md:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.n}
                className="relative flex flex-1 flex-col pl-12 md:items-center md:pl-0 md:text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
              >
                <span className="gradient-text text-5xl font-bold leading-none sm:text-6xl">
                  {step.n}
                </span>
                <span className="absolute left-0 top-2 flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background text-primary shadow-sm md:relative md:left-auto md:top-auto md:mb-4 md:mt-4">
                  <step.icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-text-primary">{step.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-secondary md:mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
