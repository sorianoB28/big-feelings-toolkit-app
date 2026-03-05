"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { buttonPrimaryClass, buttonSecondaryClass } from "@/components/ui/form-styles";
import { useStudentTheme } from "@/hooks/useStudentTheme";
import { AVATARS } from "@/lib/student-options";
import { ResetMeter } from "@/components/student/reset-meter";

type StudentHomeProps = {
  studentName: string;
  avatarKey: string | null;
  themeKey: string | null;
  points: number;
  studentId: string | null;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function StudentHome({
  studentName,
  avatarKey,
  themeKey,
  points,
  studentId,
}: StudentHomeProps) {
  const studentTheme = useStudentTheme(themeKey);
  const avatar = AVATARS.find((item) => item.key === avatarKey) ?? null;
  const resetPoints = clamp(points % 100, 0, 100);

  return (
    <section className="relative min-h-[calc(100vh-72px)] overflow-hidden py-8">
      <div
        className={`absolute inset-0 z-0 bg-gradient-to-br ${studentTheme.backgroundClassName}`}
        style={{ backgroundImage: studentTheme.backgroundGradient }}
      />
      <div
        className="absolute inset-0 z-0"
        style={{
          opacity: studentTheme.patternOverlay.opacity,
          backgroundImage: studentTheme.patternOverlay.backgroundImage,
        }}
      />
      <div className="pointer-events-none absolute -left-20 -top-16 z-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 z-0 h-72 w-72 rounded-full bg-gray-500/10 blur-3xl" />

      <div className="app-container relative z-10">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <GlassCard variant="default" accent className="p-6 sm:p-8">
            <div className="flex items-center gap-4">
              {avatar ? (
                <div className="h-16 w-16 overflow-hidden rounded-full border border-gray-200 bg-gray-50 shadow-sm">
                  <Image
                    src={avatar.imageSrc}
                    alt={avatar.label}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-white text-lg font-semibold text-gray-600 shadow-sm">
                  {studentName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Student Home</p>
                <h1 className="mt-1 tracking-tight">{studentName}</h1>
                <p className="mt-1 text-sm text-gray-700">
                  Ready for a quick reset? Pick your next calm step.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link href="/reset" className={`${buttonPrimaryClass} min-h-12 gap-2`}>
                Start Reset Journey
                <ArrowRight className="h-4 w-4" />
              </Link>

              {studentId ? (
                <Link
                  href={`/students/${encodeURIComponent(studentId)}/rewards`}
                  className={`${buttonSecondaryClass} min-h-12 gap-2`}
                >
                  <Award className="h-4 w-4" />
                  My Rewards
                </Link>
              ) : (
                <div className="inline-flex min-h-12 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-500 shadow-sm">
                  My Rewards (Teacher Access)
                </div>
              )}
            </div>
          </GlassCard>

          <ResetMeter resetPoints={resetPoints} maxPoints={100} />
        </div>
      </div>
    </section>
  );
}

