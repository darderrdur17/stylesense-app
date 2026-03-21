"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTA() {
  return (
    <section className="bg-background px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
      >
        <div className="gradient-bg px-6 py-16 text-center sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Dress Smarter?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-white/80">
              Join thousands who never stare at their closet wondering what to
              wear. Your AI stylist is waiting.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-primary shadow-xl transition hover:bg-white/90"
              >
                Start Styling Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="text-sm text-white/60">
                No credit card required
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
