"use client";

import Link from "next/link";
import { MotionCard } from "@/components/animations/motion-card";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { toolIcons } from "@/lib/icons";
import { fadeInUp } from "@/lib/motion";

type ToolLibraryCardProps = {
  href: string;
  toolKey: string;
  title: string;
  description: string;
  durationLabel: string;
};

export function ToolLibraryCard({
  href,
  toolKey,
  title,
  description,
  durationLabel,
}: ToolLibraryCardProps) {
  const Icon = toolIcons[toolKey as keyof typeof toolIcons] ?? toolIcons.default;

  return (
    <MotionCard className="h-full">
      <GlassCard
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        variant="default"
        className="h-full"
      >
        <Link href={href} className="group block h-full p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-gray-100 p-2 text-dark transition-colors duration-[250ms] group-hover:bg-primary/10 group-hover:text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-dark">{title}</h3>
                <p className="mt-2 text-sm text-gray-700">{description}</p>
              </div>
            </div>
            <Badge variant="outline" className="shrink-0">
              {durationLabel}
            </Badge>
          </div>
        </Link>
      </GlassCard>
    </MotionCard>
  );
}
