"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "bft.classroomSafeMode";

const listeners = new Set<(value: boolean) => void>();
let cachedValue = false;
let hasLoaded = false;
let hasStorageListener = false;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readFromStorage(): boolean {
  if (!canUseStorage()) {
    return false;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "1";
}

function writeToStorage(value: boolean): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
}

function notify(value: boolean): void {
  listeners.forEach((listener) => {
    listener(value);
  });
}

function ensureLoaded(): void {
  if (hasLoaded) {
    return;
  }

  cachedValue = readFromStorage();
  hasLoaded = true;
}

function installStorageListener(): void {
  if (!canUseStorage() || hasStorageListener) {
    return;
  }

  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) {
      return;
    }

    const next = event.newValue === "1";
    cachedValue = next;
    notify(next);
  });

  hasStorageListener = true;
}

export function isClassroomSafeModeEnabled(): boolean {
  ensureLoaded();
  return cachedValue;
}

export function setClassroomSafeMode(value: boolean): void {
  ensureLoaded();
  cachedValue = value;
  writeToStorage(value);
  notify(value);
}

export function toggleClassroomSafeMode(): void {
  setClassroomSafeMode(!isClassroomSafeModeEnabled());
}

export function useClassroomSafeMode(): {
  classroomSafeMode: boolean;
  setClassroomSafeMode: (value: boolean) => void;
  toggleSafeMode: () => void;
} {
  const [classroomSafeMode, setLocalClassroomSafeMode] = useState(false);

  useEffect(() => {
    ensureLoaded();
    installStorageListener();
    setLocalClassroomSafeMode(cachedValue);

    const listener = (value: boolean) => {
      setLocalClassroomSafeMode(value);
    };

    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const handleSetClassroomSafeMode = useCallback((value: boolean) => {
    setClassroomSafeMode(value);
  }, []);

  const toggleSafeModeHandler = useCallback(() => {
    toggleClassroomSafeMode();
  }, []);

  // TODO(phase-2): persist this setting to DB by teacher/classroom/student scope.
  return {
    classroomSafeMode,
    setClassroomSafeMode: handleSetClassroomSafeMode,
    toggleSafeMode: toggleSafeModeHandler,
  };
}

