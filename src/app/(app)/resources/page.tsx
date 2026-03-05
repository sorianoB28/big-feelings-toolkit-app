import Link from "next/link";
import { BookOpenCheck, Clapperboard, HeartHandshake } from "lucide-react";
import { buttonSecondaryClass } from "@/components/ui/form-styles";
import { GlassCard } from "@/components/ui/glass-card";
import { PageTransition } from "@/components/animations/page-transition";

const RESOURCE_CARDS = [
  {
    title: "Teacher Guides",
    description: "Practical classroom strategies, scripts, and routines for daily emotional regulation support.",
    href: "#",
    cta: "Open Guides",
    Icon: BookOpenCheck,
  },
  {
    title: "SEL Videos",
    description: "Short, ready-to-use videos that model breathing, grounding, and reflection techniques.",
    href: "#",
    cta: "Watch Videos",
    Icon: Clapperboard,
  },
  {
    title: "Parent Resources",
    description: "Family-facing materials to reinforce school strategies and emotional language at home.",
    href: "#",
    cta: "View Resources",
    Icon: HeartHandshake,
  },
] as const;

export default function ResourcesPage() {
  return (
    <PageTransition>
      <GlassCard variant="soft" accent className="p-6 sm:p-8">
        <h1 className="tracking-tight">Resources</h1>
        <p className="mt-2 text-sm text-gray-700">
          Explore curated materials to support students, classrooms, and families.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {RESOURCE_CARDS.map((resource) => (
            <GlassCard
              key={resource.title}
              variant="default"
              hover
              className="p-5"
            >
              <div className="inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                <resource.Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-dark">{resource.title}</h2>
              <p className="mt-2 text-sm text-gray-700">{resource.description}</p>
              <Link href={resource.href} className={`${buttonSecondaryClass} mt-5`}>
                {resource.cta}
              </Link>
            </GlassCard>
          ))}
        </div>
      </GlassCard>
    </PageTransition>
  );
}
