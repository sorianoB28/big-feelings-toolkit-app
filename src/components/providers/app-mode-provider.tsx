"use client";

import { useMemo, type ReactNode } from "react";
import { AppModeContext, DEFAULT_APP_MODE } from "@/lib/app-mode";

type AppModeProviderProps = {
  children: ReactNode;
};

export function AppModeProvider({ children }: AppModeProviderProps) {
  const value = useMemo(
    () => ({
      mode: DEFAULT_APP_MODE,
      setAppMode: () => {},
      isToolkitMode: true,
      isDemoMode: false,
    }),
    [],
  );

  return <AppModeContext.Provider value={value}>{children}</AppModeContext.Provider>;
}
