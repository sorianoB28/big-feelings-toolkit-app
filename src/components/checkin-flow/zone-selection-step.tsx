"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CHECKIN_FEELINGS, CHECKIN_ZONES, type CheckinZoneKey } from "@/lib/checkin";
import { cn } from "@/lib/utils";
import { CheckInImageFrame } from "./check-in-image-frame";
import { useGuidedCheckIn } from "./check-in-provider";

const feelingLabelByKey = new Map(CHECKIN_FEELINGS.map((feeling) => [feeling.key, feeling.label]));

const zoneThemeClassNames: Record<
  CheckinZoneKey,
  {
    shell: string;
    imageGlow: string;
    chip: string;
    badge: string;
    selectedRing: string;
  }
> = {
  red: {
    shell:
      "bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,243,243,0.96))] hover:border-rose-200/90 hover:shadow-[0_28px_60px_-36px_rgba(225,29,72,0.28)]",
    imageGlow: "bg-rose-200/55",
    chip: "bg-rose-100/85 text-rose-800",
    badge: "bg-rose-100 text-rose-800",
    selectedRing: "border-rose-300/90 ring-2 ring-rose-200/80",
  },
  yellow: {
    shell:
      "bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,250,236,0.96))] hover:border-amber-200/90 hover:shadow-[0_28px_60px_-36px_rgba(217,119,6,0.24)]",
    imageGlow: "bg-amber-200/55",
    chip: "bg-amber-100/85 text-amber-800",
    badge: "bg-amber-100 text-amber-800",
    selectedRing: "border-amber-300/90 ring-2 ring-amber-200/80",
  },
  blue: {
    shell:
      "bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,247,255,0.96))] hover:border-sky-200/90 hover:shadow-[0_28px_60px_-36px_rgba(14,116,144,0.24)]",
    imageGlow: "bg-sky-200/55",
    chip: "bg-sky-100/85 text-sky-800",
    badge: "bg-sky-100 text-sky-800",
    selectedRing: "border-sky-300/90 ring-2 ring-sky-200/80",
  },
  green: {
    shell:
      "bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,253,248,0.96))] hover:border-emerald-200/90 hover:shadow-[0_28px_60px_-36px_rgba(5,150,105,0.24)]",
    imageGlow: "bg-emerald-200/55",
    chip: "bg-emerald-100/85 text-emerald-800",
    badge: "bg-emerald-100 text-emerald-800",
    selectedRing: "border-emerald-300/90 ring-2 ring-emerald-200/80",
  },
};

function getSampleFeelingLabels(zoneKey: CheckinZoneKey): string[] {
  const zone = CHECKIN_ZONES.find((item) => item.key === zoneKey);

  if (!zone) {
    return [];
  }

  return zone.feelings
    .slice(0, 4)
    .map((feelingKey) => feelingLabelByKey.get(feelingKey) ?? feelingKey)
    .filter(Boolean);
}

export function ZoneSelectionStep() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const { state, setZone } = useGuidedCheckIn();

  function handleSelect(zoneKey: CheckinZoneKey) {
    setZone(zoneKey);
    router.push("/check-in/feeling");
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="toolkit-panel-strong px-6 py-6 sm:px-7 sm:py-7">
          <Badge>Zone</Badge>
          <h2 className="mt-4">Choose the zone that feels closest right now.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Zones are a way to organize feelings and body energy. They are not about being
            &quot;good&quot; or &quot;bad&quot; and they do not define who you are.
          </p>
        </div>

        <aside className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
            How to use this
          </p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>Pick the zone that feels closest, even if more than one could fit.</p>
            <p>The next step will help narrow that into a more specific feeling.</p>
          </div>
        </aside>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:gap-6">
        {CHECKIN_ZONES.map((zone) => {
          const isSelected = state.zoneKey === zone.key;
          const theme = zoneThemeClassNames[zone.key];
          const sampleFeelings = getSampleFeelingLabels(zone.key);

          return (
            <motion.button
              key={zone.key}
              type="button"
              onClick={() => handleSelect(zone.key)}
              whileHover={prefersReducedMotion ? undefined : { y: -3 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
              className={cn(
                "toolkit-focus-ring group relative overflow-hidden rounded-[2rem] border border-white/78 p-0 text-left transition duration-[240ms] ease-out",
                theme.shell,
                isSelected && theme.selectedRing
              )}
              aria-pressed={isSelected}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.42),transparent)]" />
              <div
                className={cn(
                  "pointer-events-none absolute -right-10 top-10 h-32 w-32 rounded-full blur-3xl transition duration-[240ms] ease-out",
                  theme.imageGlow
                )}
              />

              <div className="relative flex h-full flex-col gap-4 p-4 sm:gap-[1.125rem] sm:p-5">
                <div className="relative overflow-hidden rounded-[1.7rem] border border-white/72 bg-white/88 p-2 shadow-[0_24px_46px_-32px_rgba(15,23,42,0.2)] sm:p-2.5">
                  <CheckInImageFrame
                    src={zone.imagePath}
                    alt={zone.alt}
                    sizes="(min-width: 1024px) 26rem, (min-width: 768px) 45vw, 100vw"
                    aspectClassName="aspect-[8/5]"
                    imageClassName="object-contain p-1 sm:p-1.5"
                    className="bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(245,248,255,0.94))]"
                  />
                </div>

                <div className="space-y-3.5 px-1 pb-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                          theme.badge
                        )}
                      >
                        {zone.emotionalGrouping}
                      </span>
                      <h3 className="mt-3 text-[1.42rem] tracking-[-0.03em] text-dark">
                        {zone.label}
                      </h3>
                    </div>

                    {isSelected ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-primary-dark px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-[0_18px_34px_-20px_rgba(33,77,147,0.44)]">
                        <CheckCircle2 className="h-4 w-4" />
                        Selected
                      </span>
                    ) : null}
                  </div>

                  <p className="text-sm leading-7 text-slate-600 sm:text-[15px]">
                    {zone.supportingLine}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {sampleFeelings.map((feeling) => (
                      <span
                        key={`${zone.key}-${feeling}`}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em]",
                          theme.chip
                        )}
                      >
                        {feeling}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-white/65 pt-4">
                    <p className="text-sm font-medium text-slate-600">
                      {isSelected ? "Selected now. Continue to feelings." : "Choose the closest fit and keep going."}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-dark">
                      Continue
                      <ArrowRight className="h-4 w-4 transition-transform duration-[220ms] ease-out group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </section>
    </div>
  );
}
