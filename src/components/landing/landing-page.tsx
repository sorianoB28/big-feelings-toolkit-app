"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { buttonPrimaryClass, buttonSecondaryClass } from "@/components/ui/form-styles";

const featureCards = [
  {
    icon: "🧭",
    title: "Student emotional check-ins",
    description: "Quick, structured check-ins help students name feelings and choose next steps.",
  },
  {
    icon: "🫁",
    title: "Interactive calming tools",
    description: "Guided breathing and grounding tools support steady regulation during the school day.",
  },
  {
    icon: "🧑‍🏫",
    title: "Teacher-guided reflection",
    description: "Simple reflection flows help students return to class with a clear plan.",
  },
] as const;

export function LandingPage() {
  return (
    <div className="bg-[linear-gradient(to_bottom,#E6E6E6,#ffffff)]">
      <section className="app-container app-page relative overflow-hidden">
        <div className="pointer-events-none absolute -left-20 top-16 h-56 w-56 rounded-full bg-primary opacity-[0.07]" />
        <div className="pointer-events-none absolute right-6 top-6 h-40 w-40 rounded-full bg-primary opacity-[0.06]" />
        <div className="pointer-events-none absolute -right-16 bottom-20 h-64 w-64 rounded-full bg-primary opacity-[0.05]" />

        <div className="app-card relative p-10 shadow-md">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-dark">
                Oakestown Intermediate
              </p>
              <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">Big Feelings Toolkit</h1>
              <p className="mt-4 max-w-xl text-base text-gray-700 sm:text-lg">
                A teacher-led emotional regulation system for Oakestown students.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/auth/signin" className={buttonPrimaryClass}>
                  Sign In
                </Link>
                <a href="#learn-more" className={buttonSecondaryClass}>
                  Learn More
                </a>
              </div>
            </div>

            <div className="relative flex min-h-[280px] items-center justify-center">
              <div className="absolute h-64 w-64 rounded-full bg-primary/10 blur-2xl" />
              <motion.div
                animate={{ scale: [0.88, 1.1, 0.88] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute h-52 w-52 rounded-full border-2 border-primary/40"
              />
              <motion.div
                animate={{ scale: [1.06, 0.92, 1.06] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                className="absolute h-40 w-40 rounded-full border-2 border-primary/60"
              />
              <motion.div
                animate={{ scale: [0.95, 1.08, 0.95] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                className="flex h-28 w-28 items-center justify-center rounded-full bg-primary text-sm font-semibold uppercase tracking-wide text-white shadow-md"
              >
                Breathe
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section id="learn-more" className="app-container pb-10">
        <div className="grid gap-6 md:grid-cols-3">
          {featureCards.map((card) => (
            <motion.article
              key={card.title}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="app-card p-6"
            >
              <div className="text-2xl">{card.icon}</div>
              <h3 className="mt-4 text-lg font-semibold text-dark">{card.title}</h3>
              <p className="mt-2 text-sm text-gray-700">{card.description}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <footer className="border-t border-border-soft bg-surface">
        <div className="app-container py-6 text-center text-sm text-gray-700">
          <p>Oakestown Intermediate</p>
          <p className="font-medium text-dark">Big Feelings Toolkit</p>
        </div>
      </footer>
    </div>
  );
}
