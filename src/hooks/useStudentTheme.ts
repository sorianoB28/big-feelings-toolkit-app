"use client";

import { useMemo } from "react";
import type { StudentThemeOption } from "@/lib/student-options";

type PatternOverlayConfig = {
  opacity: number;
  backgroundImage: string;
};

export type StudentThemeConfig = {
  key: StudentThemeOption["key"];
  backgroundGradient: string;
  backgroundClassName: string;
  panelClassName: string;
  patternOverlay: PatternOverlayConfig;
};

const STUDENT_THEMES: Record<StudentThemeOption["key"], StudentThemeConfig> = {
  ocean: {
    key: "ocean",
    backgroundGradient:
      "linear-gradient(160deg, rgba(235,244,252,0.98) 0%, rgba(246,250,255,0.98) 45%, rgba(224,238,252,0.98) 100%)",
    backgroundClassName: "from-sky-100/70 via-blue-50/70 to-cyan-100/65",
    panelClassName: "bg-white/82",
    patternOverlay: {
      opacity: 0.08,
      backgroundImage:
        "radial-gradient(circle at 16% 18%, rgba(47,95,158,0.20) 0%, rgba(47,95,158,0) 42%), radial-gradient(circle at 84% 78%, rgba(86,163,110,0.14) 0%, rgba(86,163,110,0) 40%)",
    },
  },
  space: {
    key: "space",
    backgroundGradient:
      "linear-gradient(165deg, rgba(234,238,248,0.98) 0%, rgba(246,247,252,0.98) 52%, rgba(224,231,246,0.98) 100%)",
    backgroundClassName: "from-slate-100/75 via-indigo-50/65 to-slate-200/70",
    panelClassName: "bg-white/84",
    patternOverlay: {
      opacity: 0.06,
      backgroundImage:
        "radial-gradient(circle at 24% 26%, rgba(61,79,120,0.20) 0%, rgba(61,79,120,0) 38%), radial-gradient(circle at 78% 68%, rgba(134,38,51,0.16) 0%, rgba(134,38,51,0) 36%)",
    },
  },
  cozy: {
    key: "cozy",
    backgroundGradient:
      "linear-gradient(160deg, rgba(248,241,232,0.98) 0%, rgba(252,248,242,0.98) 48%, rgba(242,231,217,0.98) 100%)",
    backgroundClassName: "from-amber-100/65 via-orange-50/60 to-stone-200/65",
    panelClassName: "bg-white/86",
    patternOverlay: {
      opacity: 0.07,
      backgroundImage:
        "radial-gradient(circle at 20% 20%, rgba(140,101,62,0.16) 0%, rgba(140,101,62,0) 42%), radial-gradient(circle at 82% 72%, rgba(134,38,51,0.14) 0%, rgba(134,38,51,0) 38%)",
    },
  },
};

export function useStudentTheme(themeKey: string | null | undefined): StudentThemeConfig {
  return useMemo(() => {
    if (themeKey === "ocean" || themeKey === "space" || themeKey === "cozy") {
      return STUDENT_THEMES[themeKey];
    }

    return STUDENT_THEMES.ocean;
  }, [themeKey]);
}
