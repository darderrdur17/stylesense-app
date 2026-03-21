"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "StyleSense completely changed how I pack for trips. I used to overpack every time—now I bring exactly what I need.",
    name: "Sarah K.",
    role: "Travel Blogger",
    initials: "SK",
    gradient: "from-primary to-primary-light",
  },
  {
    quote:
      "The weather-based suggestions are surprisingly accurate. It's like having a stylist who checks the forecast for me.",
    name: "Marcus L.",
    role: "Software Engineer",
    initials: "ML",
    gradient: "from-accent to-accent-light",
  },
  {
    quote:
      "I love the outfit memory feature. Looking back at what I wore in different cities is so fun and useful.",
    name: "Priya D.",
    role: "Fashion Enthusiast",
    initials: "PD",
    gradient: "from-primary to-accent",
  },
];

export function Testimonials() {
  return (
    <section className="bg-background px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Loved by <span className="gradient-text">Style-Savvy</span> People
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Hear from people who dress smarter every day with StyleSense.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="card-hover relative rounded-2xl border border-border bg-surface p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
            >
              <Quote className="mb-4 h-8 w-8 text-primary/20" />
              <p className="text-sm leading-relaxed text-text-secondary">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-xs font-bold text-white`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {t.name}
                  </p>
                  <p className="text-xs text-text-muted">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
