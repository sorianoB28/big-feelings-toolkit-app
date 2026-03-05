"use client";

import { useMemo } from "react";
import type { CheckinZoneId } from "@/lib/checkin-options";

type ZoneTheme = {
  zone: CheckinZoneId;
  backgroundGradient: string;
  primaryColor: string;
  accentColor: string;
};

const ZONE_THEMES: Record<CheckinZoneId, ZoneTheme> = {
  green: {
    zone: "green",
    backgroundGradient:
      "linear-gradient(145deg, rgba(226,245,233,1) 0%, rgba(244,252,246,1) 48%, rgba(206,237,215,1) 100%)",
    primaryColor: "#2f7a45",
    accentColor: "#56a36e",
  },
  blue: {
    zone: "blue",
    backgroundGradient:
      "linear-gradient(145deg, rgba(225,236,252,1) 0%, rgba(241,247,255,1) 48%, rgba(204,223,248,1) 100%)",
    primaryColor: "#2f5f9e",
    accentColor: "#4f7fc2",
  },
  yellow: {
    zone: "yellow",
    backgroundGradient:
      "linear-gradient(145deg, rgba(255,246,218,1) 0%, rgba(255,251,236,1) 45%, rgba(252,231,172,1) 100%)",
    primaryColor: "#9c6a12",
    accentColor: "#d09c33",
  },
  red: {
    zone: "red",
    backgroundGradient:
      "linear-gradient(145deg, rgba(245,226,228,1) 0%, rgba(250,241,242,1) 45%, rgba(234,204,207,1) 100%)",
    primaryColor: "#862633",
    accentColor: "#a94753",
  },
};

export function useZoneTheme(zone: CheckinZoneId | null | undefined): ZoneTheme {
  return useMemo(() => {
    if (!zone) {
      return ZONE_THEMES.green;
    }

    return ZONE_THEMES[zone];
  }, [zone]);
}
