"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MoveRight, PersonStanding, Wind, HandHeart, Sparkles } from "lucide-react";
import { MotionCard } from "@/components/animations/motion-card";
import { toolIcons } from "@/lib/icons";
import { recommendTools, type RecommendationIntent, type RecommendationZone } from "@/lib/tools/recommend";
import { cn } from "@/lib/utils";

type ZoneId = RecommendationZone;
type ResetChoiceId = RecommendationIntent;

type ZoneOption = {
  id: ZoneId;
  emoji: string;
  title: string;
  description: string;
  cardClass: string;
};

const ZONES: ZoneOption[] = [
  {
    id: "green",
    emoji: "🟢",
    title: "Green Zone",
    description: "Ready to learn and stay steady.",
    cardClass: "border-emerald-300 bg-emerald-50",
  },
  {
    id: "yellow",
    emoji: "🟡",
    title: "Yellow Zone",
    description: "Wiggly, worried, or distracted.",
    cardClass: "border-amber-300 bg-amber-50",
  },
  {
    id: "blue",
    emoji: "🔵",
    title: "Blue Zone",
    description: "Low energy, tired, or sad.",
    cardClass: "border-sky-300 bg-sky-50",
  },
  {
    id: "red",
    emoji: "🔴",
    title: "Red Zone",
    description: "Big feelings, high energy, overwhelmed.",
    cardClass: "border-rose-300 bg-rose-50",
  },
];

const RESET_CHOICES: Array<{
  id: ResetChoiceId;
  label: string;
  description: string;
  Icon: typeof Wind;
}> = [
  {
    id: "breathe",
    label: "Breathe",
    description: "Slow down and steady your body.",
    Icon: Wind,
  },
  {
    id: "move",
    label: "Move",
    description: "Use movement to release extra energy.",
    Icon: PersonStanding,
  },
  {
    id: "ground",
    label: "Ground",
    description: "Bring your mind back to right now.",
    Icon: Sparkles,
  },
  {
    id: "support",
    label: "Get Support",
    description: "Ask for help from a trusted adult.",
    Icon: HandHeart,
  },
];

function isZone(value: string | null): value is ZoneId {
  return value === "green" || value === "yellow" || value === "blue" || value === "red";
}

function isChoice(value: string | null): value is ResetChoiceId {
  return value === "breathe" || value === "move" || value === "ground" || value === "support";
}

export function ResetJourney() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const zoneParam = searchParams.get("zone");
  const choiceParam = searchParams.get("choice");

  const selectedZone: ZoneId | null = isZone(zoneParam) ? zoneParam : null;
  const selectedChoice: ResetChoiceId | null = isChoice(choiceParam) ? choiceParam : null;
  const readyToReturn = searchParams.get("ready") === "1";
  const firstStepKey = searchParams.get("firstStep");
  const otherStep = searchParams.get("otherStep");
  const selectedZoneOption = ZONES.find((zone) => zone.id === selectedZone) ?? null;
  const selectedChoiceOption =
    RESET_CHOICES.find((choice) => choice.id === selectedChoice) ?? null;

  const currentStep = selectedZone ? (selectedChoice ? 3 : 2) : 1;
  const progressPercent = Math.round((currentStep / 3) * 100);

  const recommendedTools = useMemo(() => {
    if (!selectedChoice || !selectedZone) {
      return [];
    }

    return recommendTools({
      zone: selectedZone,
      intent: selectedChoice,
    });
  }, [selectedChoice, selectedZone]);

  function updateParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(next).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const firstStepLabel = useMemo(() => {
    if (firstStepKey === "other" && otherStep) {
      return otherStep;
    }

    if (firstStepKey === "sit_down") {
      return "Sit down";
    }
    if (firstStepKey === "open_notebook") {
      return "Open my notebook";
    }
    if (firstStepKey === "raise_hand") {
      return "Raise my hand";
    }
    if (firstStepKey === "ask_teacher") {
      return "Ask teacher for help";
    }
    if (firstStepKey === "other") {
      return "Other";
    }

    return null;
  }, [firstStepKey, otherStep]);

  return (
    <section className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-gradient-to-b from-background to-white">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-gray-500/10 blur-3xl" />

      <div className="app-container relative z-10 py-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/40 bg-white/75 p-6 shadow-md supports-[backdrop-filter]:backdrop-blur-md sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Reset Journey</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-dark">
                Let&apos;s find your next calm step
              </h1>
            </div>
            <p className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
              Step {currentStep} of 3
            </p>
          </div>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-primary transition-all duration-[250ms] ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {readyToReturn ? (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
              <p className="text-sm font-semibold text-emerald-800">You&apos;re ready to return.</p>
              {firstStepLabel ? (
                <p className="mt-1 text-sm text-emerald-900">
                  First step back: <span className="font-medium">{firstStepLabel}</span>
                </p>
              ) : null}
              <button
                type="button"
                onClick={() =>
                  updateParams({
                    ready: null,
                    firstStep: null,
                    otherStep: null,
                  })
                }
                className="mt-3 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 transition duration-[250ms] ease-out hover:bg-emerald-100"
              >
                Dismiss
              </button>
            </div>
          ) : null}

          <div className="mt-8 space-y-8">
            {!selectedZone ? (
              <section>
                <h2 className="text-xl font-semibold text-dark">1. Choose your zone</h2>
                <p className="mt-1 text-sm text-gray-700">Pick the color that matches how you feel right now.</p>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {ZONES.map((zone) => (
                    <MotionCard key={zone.id}>
                      <button
                        type="button"
                        onClick={() => updateParams({ zone: zone.id, choice: null })}
                        className={cn(
                          "h-full w-full rounded-xl border p-5 text-left transition duration-[250ms] ease-out hover:border-primary/35",
                          zone.cardClass
                        )}
                      >
                        <p className="text-2xl">{zone.emoji}</p>
                        <p className="mt-2 text-base font-semibold text-dark">{zone.title}</p>
                        <p className="mt-1 text-sm text-gray-700">{zone.description}</p>
                      </button>
                    </MotionCard>
                  ))}
                </div>
              </section>
            ) : null}

            {selectedZone && !selectedChoice ? (
              <section>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-dark">2. How do you want to reset?</h2>
                    <p className="mt-1 text-sm text-gray-700">Choose one path to support your next step.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateParams({ zone: null, choice: null })}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-dark transition duration-[250ms] ease-out hover:bg-gray-100"
                  >
                    Change Zone
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {RESET_CHOICES.map((choice) => (
                    <MotionCard key={choice.id}>
                      <button
                        type="button"
                        onClick={() => updateParams({ choice: choice.id })}
                        className="h-full w-full rounded-xl border border-border-soft bg-white p-5 text-left transition duration-[250ms] ease-out hover:border-primary/35 hover:bg-primary/5"
                      >
                        <choice.Icon className="h-6 w-6 text-primary" />
                        <p className="mt-3 text-base font-semibold text-dark">{choice.label}</p>
                        <p className="mt-1 text-sm text-gray-700">{choice.description}</p>
                      </button>
                    </MotionCard>
                  ))}
                </div>
              </section>
            ) : null}

            {selectedZone && selectedChoice ? (
              <section>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-dark">3. Recommended tools</h2>
                    <p className="mt-1 text-sm text-gray-700">
                      Start one tool and follow it all the way through.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => updateParams({ choice: null })}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-dark transition duration-[250ms] ease-out hover:bg-gray-100"
                    >
                      Change Reset Type
                    </button>
                    <button
                      type="button"
                      onClick={() => updateParams({ zone: null, choice: null })}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-dark transition duration-[250ms] ease-out hover:bg-gray-100"
                    >
                      Start Over
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-primary-dark">
                    Zone: {selectedZoneOption?.title ?? selectedZone}
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                    Choice: {selectedChoiceOption?.label}
                  </span>
                </div>

                {recommendedTools.length > 0 ? (
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {recommendedTools.map((tool) => {
                      const Icon =
                        toolIcons[tool.toolKey as keyof typeof toolIcons] ?? toolIcons.default;

                      return (
                        <MotionCard key={tool.toolKey} className="h-full">
                          <article className="flex h-full flex-col rounded-xl border border-border-soft bg-white p-5 shadow-sm">
                            <div className="inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                              <Icon className="h-5 w-5" />
                            </div>
                            <h3 className="mt-3 text-base font-semibold text-dark">{tool.title}</h3>
                            <p className="mt-2 flex-1 text-sm text-gray-700">{tool.description}</p>
                            <Link
                              href={`/tools/${tool.toolKey}?from=reset&zone=${selectedZone}`}
                              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-[250ms] ease-out hover:bg-primary-dark"
                            >
                              Start Tool
                              <MoveRight className="h-4 w-4" />
                            </Link>
                          </article>
                        </MotionCard>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-border-soft bg-white p-5 text-sm text-gray-700">
                    No tools are currently available for this reset path.
                  </div>
                )}
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
