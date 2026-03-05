"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MotionCard } from "@/components/animations/motion-card";
import { GlassCard } from "@/components/ui/glass-card";
import { buttonPrimaryClass, buttonSecondaryClass } from "@/components/ui/form-styles";
import { dashboardStatIcons } from "@/lib/icons";
import { fadeInUp, staggerContainer } from "@/lib/motion";

type DashboardOverviewProps = {
  displayName: string;
  stats: {
    students: number;
    activeCheckins: number;
    toolsUsedToday: number;
    staffMembers: number;
  };
};

export function DashboardOverview({ displayName, stats }: DashboardOverviewProps) {
  const statCards = [
    { label: "Students", value: stats.students, icon: dashboardStatIcons.students },
    { label: "Active Check-ins", value: stats.activeCheckins, icon: dashboardStatIcons.active_checkins },
    { label: "Tools Used Today", value: stats.toolsUsedToday, icon: dashboardStatIcons.tools_used_today },
    { label: "Staff Members", value: stats.staffMembers, icon: dashboardStatIcons.staff_members },
  ] as const;

  return (
    <GlassCard variant="soft" accent className="p-6 sm:p-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Welcome, {displayName}</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage emotional regulation tools and student support.
        </p>
      </header>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <MotionCard key={card.label}>
              <GlassCard variants={fadeInUp} variant="default" className="group p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{card.label}</span>
                  <Icon className="h-5 w-5 text-dark transition-colors duration-[250ms] group-hover:text-primary" />
                </div>
                <p className="mt-3 text-3xl font-semibold text-dark">{card.value.toLocaleString()}</p>
              </GlassCard>
            </MotionCard>
          );
        })}
      </motion.div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href="/checkins" className={buttonPrimaryClass}>
            Start Check-in
          </Link>
          <Link href="/students" className={buttonSecondaryClass}>
            View Students
          </Link>
          <Link href="/tools" className={buttonSecondaryClass}>
            Open Tools
          </Link>
        </div>
      </section>
    </GlassCard>
  );
}
