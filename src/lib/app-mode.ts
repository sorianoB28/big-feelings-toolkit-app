"use client";

import { createContext, useContext } from "react";
import {
  APP_MODE_COOKIE_KEY,
  APP_MODE_STORAGE_KEY,
  DEFAULT_APP_MODE,
  isAppMode,
  type AppMode,
} from "@/lib/app-mode-config";

export { APP_MODES, APP_MODE_COOKIE_KEY, APP_MODE_STORAGE_KEY, DEFAULT_APP_MODE } from "@/lib/app-mode-config";
export type { AppMode } from "@/lib/app-mode-config";

type AppModeListener = (mode: AppMode) => void;

const listeners = new Set<AppModeListener>();

let cachedMode: AppMode = DEFAULT_APP_MODE;
let hasLoaded = false;
let hasStorageListener = false;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function canUseCookies(): boolean {
  return typeof document !== "undefined";
}

function writeCookie(mode: AppMode): void {
  if (!canUseCookies()) {
    return;
  }

  document.cookie = `${APP_MODE_COOKIE_KEY}=${mode}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

function readFromStorage(): AppMode {
  if (!canUseStorage()) {
    return DEFAULT_APP_MODE;
  }

  const rawValue = window.localStorage.getItem(APP_MODE_STORAGE_KEY);
  return isAppMode(rawValue) ? rawValue : DEFAULT_APP_MODE;
}

function writeToStorage(mode: AppMode): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(APP_MODE_STORAGE_KEY, mode);
  writeCookie(mode);
}

function notify(mode: AppMode): void {
  listeners.forEach((listener) => {
    listener(mode);
  });
}

function ensureLoaded(): void {
  if (hasLoaded) {
    return;
  }

  cachedMode = readFromStorage();
  hasLoaded = true;
  writeCookie(cachedMode);
}

function installStorageListener(): void {
  if (!canUseStorage() || hasStorageListener) {
    return;
  }

  window.addEventListener("storage", (event) => {
    if (event.key !== APP_MODE_STORAGE_KEY) {
      return;
    }

    const nextMode = isAppMode(event.newValue) ? event.newValue : DEFAULT_APP_MODE;
    cachedMode = nextMode;
    writeCookie(nextMode);
    notify(nextMode);
  });

  hasStorageListener = true;
}

export function initializeAppMode(): AppMode {
  ensureLoaded();
  installStorageListener();
  return cachedMode;
}

export function subscribeToAppMode(listener: AppModeListener): () => void {
  ensureLoaded();
  installStorageListener();
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getAppMode(): AppMode {
  ensureLoaded();
  return cachedMode;
}

export function setAppMode(mode: AppMode): void {
  ensureLoaded();
  cachedMode = mode;
  writeToStorage(mode);
  notify(mode);
}

export function isToolkitMode(mode: AppMode = getAppMode()): boolean {
  return mode === "toolkit";
}

export function isDemoMode(mode: AppMode = getAppMode()): boolean {
  return mode === "demo";
}

export type AppModeContextValue = {
  mode: AppMode;
  setAppMode: (mode: AppMode) => void;
  isToolkitMode: boolean;
  isDemoMode: boolean;
};

export const AppModeContext = createContext<AppModeContextValue | undefined>(undefined);

export function useAppMode(): AppModeContextValue {
  const context = useContext(AppModeContext);

  if (!context) {
    throw new Error("useAppMode must be used within an AppModeProvider.");
  }

  return context;
}
