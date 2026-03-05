import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { buttonPrimaryClass } from "@/components/ui/form-styles";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <GlassCard variant="soft" className="p-8 text-center sm:p-10">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-dark">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-700">{description}</p>
      <div className="mt-6">
        <Link href={actionHref} className={buttonPrimaryClass}>
          {actionLabel}
        </Link>
      </div>
    </GlassCard>
  );
}
