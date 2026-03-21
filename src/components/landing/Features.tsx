"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Camera,
  CloudSun,
  Palette,
  Plane,
  Shirt,
} from "lucide-react";

const features = [
  {
    title: "Digital Wardrobe",
    description: "Upload and organize your entire closet in one place.",
    icon: Shirt,
    tone: "bg-primary/15 text-primary",
  },
  {
    title: "Weather-Smart",
    description: "AI recommendations tuned to the forecast where you are.",
    icon: CloudSun,
    tone: "bg-accent/15 text-accent",
  },
  {
    title: "Travel Planner",
    description: "Pack perfectly for any destination, climate, and itinerary.",
    icon: Plane,
    tone: "bg-primary/15 text-primary",
  },
  {
    title: "Outfit Memory",
    description: "Remember what you wore and where—no more outfit déjà vu.",
    icon: Camera,
    tone: "bg-accent/15 text-accent",
  },
  {
    title: "Style Match",
    description: "Get inspired by trending styles that fit your wardrobe.",
    icon: Palette,
    tone: "bg-primary/15 text-primary",
  },
  {
    title: "Style Analytics",
    description: "Understand your fashion patterns and wear what you love.",
    icon: BarChart3,
    tone: "bg-accent/15 text-accent",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 bg-background px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Everything You Need to{" "}
            <span className="gradient-text">Dress Smarter</span>
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            From your closet to the forecast, StyleSense connects the dots so you
            always step out with confidence.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.article
              key={f.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="card-hover rounded-2xl border border-border bg-surface p-8"
            >
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${f.tone}`}
              >
                <f.icon className="h-6 w-6" strokeWidth={2} aria-hidden />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-text-primary">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {f.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
