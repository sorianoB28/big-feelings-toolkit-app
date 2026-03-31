"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AppModeContext,
  DEFAULT_APP_MODE,
  initializeAppMode,
  isDemoMode,
  isToolkitMode,
  setAppMode as persistAppMode,
  subscribeToAppMode,
  type AppMode,
} from "@/lib/app-mode";

type AppModeProviderProps = {
  children: ReactNode;
};

export function AppModeProvider({ children }: AppModeProviderProps) {
  const [mode, setMode] = useState<AppMode>(DEFAULT_APP_MODE);

  useEffect(() => {
    setMode(initializeAppMode());

    return subscribeToAppMode((nextMode) => {
      setMode(nextMode);
    });
  }, []);

  const handleSetAppMode = useCallback((nextMode: AppMode) => {
    persistAppMode(nextMode);
  }, []);

  const value = useMemo(
    () => ({
      mode,
      setAppMode: handleSetAppMode,
      isToolkitMode: isToolkitMode(mode),
      isDemoMode: isDemoMode(mode),
    }),
    [mode, handleSetAppMode],
  );

  return <AppModeContext.Provider value={value}>{children}</AppModeContext.Provider>;
}
