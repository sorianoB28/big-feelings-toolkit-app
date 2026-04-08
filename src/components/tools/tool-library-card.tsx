"use client";

import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MotionCard } from "@/components/animations/motion-card";
import { Badge } from "@/components/ui/badge";
import { toolkitButtonPrimaryClass } from "@/components/ui/form-styles";
import { toolIcons } from "@/lib/icons";
import { TOOL_CATEGORY_LABELS, getToolByKey } from "@/lib/tools/registry";
import { fadeInUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ToolLibraryCardProps = {
  href: string;
  toolKey: string;
  title: string;
  description: string;
  durationLabel: string;
  categoryLabel?: string;
  compact?: boolean;
  onClick?: () => void;
};

function ToolLibraryCardComponent({
  href,
  toolKey,
  title,
  description,
  durationLabel,
  categoryLabel,
  compact = false,
  onClick,
}: ToolLibraryCardProps) {
  const Icon = toolIcons[toolKey as keyof typeof toolIcons] ?? toolIcons.default;
  const derivedCategory = getToolByKey(toolKey)?.category ?? null;
  const resolvedCategoryLabel =
    categoryLabel ?? (derivedCategory ? TOOL_CATEGORY_LABELS[derivedCategory] : "Toolkit");
  const eyebrowLabel = compact ? resolvedCategoryLabel : "Guided Tool";
  const actionLabel = compact ? "Open Tool" : "Start Tool";

  return (
    <MotionCard className="h-full" whileHover={{ y: -4, scale: 1.008 }}>
      <motion.div
        variants={fadeInUp}
        initial={false}
        animate="animate"
        className={cn(
          "toolkit-card-shell h-full",
          compact ? "min-h-[20.75rem]" : "min-h-[24rem]",
        )}
      >
        <Link
          href={href}
          onClick={onClick}
          className={cn(
            "toolkit-focus-ring group relative z-10 flex h-full flex-col rounded-[1.85rem] focus-visible:-translate-y-0.5",
            compact ? "p-[0.85rem] sm:p-[0.95rem]" : "p-[0.95rem] sm:p-[1.05rem]",
          )}
        >
          <div
            className={cn(
              "toolkit-card-shell-header relative overflow-hidden transition duration-[250ms] ease-out group-hover:border-primary/24 group-focus-visible:border-primary/28 group-focus-visible:shadow-[0_18px_34px_-26px_rgba(79,140,255,0.24)]",
              compact ? "p-4 sm:px-5 sm:pb-5 sm:pt-5" : "p-5 sm:px-6 sm:pb-7 sm:pt-6",
            )}
          >
            <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-white/80" />
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4 sm:gap-[1.2rem]">
                <div
                  className={cn(
                    "rounded-[1.35rem] border border-white/80 bg-white/90 text-primary-dark shadow-[0_18px_38px_-28px_rgba(79,140,255,0.4)] transition duration-[250ms] ease-out group-hover:scale-[1.03] group-hover:bg-white group-focus-visible:scale-[1.03] group-focus-visible:bg-white",
                    compact ? "p-3" : "p-3.5",
                  )}
                >
                  <Icon className={cn(compact ? "h-5 w-5" : "h-6 w-6")} />
                </div>
                <div className="min-w-0 pt-0.5 pr-2">
                  <p className="toolkit-eyebrow text-primary-dark/70">
                    {eyebrowLabel}
                  </p>
                  <h3
                    className={cn(
                      "font-semibold leading-tight tracking-[-0.03em] text-dark",
                      compact ? "mt-1.5 text-[1.1rem]" : "mt-2 text-xl",
                    )}
                  >
                    {title}
                  </h3>
                </div>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 self-start whitespace-nowrap bg-white/86 px-3 py-1.5 shadow-sm transition duration-[250ms] ease-out group-hover:bg-white group-focus-visible:bg-white"
              >
                {durationLabel}
              </Badge>
            </div>
          </div>

          <div
            className={cn(
              "toolkit-card-shell-body mt-3 flex flex-1 flex-col transition duration-[250ms] ease-out group-hover:border-primary/20 group-focus-visible:border-primary/24",
              compact ? "gap-4 px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-4" : "gap-5 px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-5",
            )}
          >
            <div className={cn("pr-1", compact ? "min-h-[4.8rem]" : "min-h-[5.75rem] sm:min-h-[6.1rem]")}>
              <p className="toolkit-body-copy">{description}</p>
            </div>

            <div
              className={cn(
                "mt-auto border-t border-slate-100",
                compact
                  ? "flex items-center justify-end pt-3.5"
                  : "flex flex-col gap-3.5 pt-4 sm:flex-row sm:items-end sm:justify-between sm:pt-5",
              )}
            >
              {!compact ? (
                <span className="inline-flex w-fit items-center self-start rounded-full bg-primary/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-dark">
                  {resolvedCategoryLabel}
                </span>
              ) : null}
              <span
                className={cn(
                  toolkitButtonPrimaryClass,
                  compact
                    ? "min-h-10 w-full justify-center gap-2 px-4 py-2 text-sm shadow-[0_18px_38px_-24px_rgba(79,140,255,0.42)] group-focus-visible:shadow-[0_20px_42px_-24px_rgba(79,140,255,0.48)] sm:w-auto"
                    : "min-h-11 w-full justify-center gap-2 px-4 py-2 text-sm shadow-[0_18px_38px_-24px_rgba(79,140,255,0.42)] group-focus-visible:shadow-[0_20px_42px_-24px_rgba(79,140,255,0.48)] sm:min-h-0 sm:w-auto sm:shrink-0 sm:self-end",
                )}
              >
                {actionLabel}
                <ArrowRight className="h-4 w-4 transition-transform duration-[250ms] ease-out group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5" />
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    </MotionCard>
  );
}

ToolLibraryCardComponent.displayName = "ToolLibraryCard";

export const ToolLibraryCard = memo(ToolLibraryCardComponent);
