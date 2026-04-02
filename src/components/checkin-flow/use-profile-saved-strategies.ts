"use client";

import { useEffect, useMemo, useState } from "react";
import type { CheckinStrategyCategoryKey, CheckinStrategyKey } from "@/lib/checkin";

type SavedStrategiesResponse = {
  strategies?: Array<{
    strategyKey: CheckinStrategyKey;
  }>;
  error?: string;
};

type UseProfileSavedStrategiesInput = {
  enabled: boolean;
  profileId: string | null;
  initialSavedStrategyKeys?: CheckinStrategyKey[];
};

function uniqueKeys<TKey extends string>(values: readonly TKey[]): TKey[] {
  return Array.from(new Set(values));
}

type SavedStrategyCacheEntry = {
  savedStrategyKeys: CheckinStrategyKey[];
  fetchedAt: number;
};

const SAVED_STRATEGY_CACHE_TTL_MS = 2 * 60 * 1000;
const savedStrategyCache = new Map<string, SavedStrategyCacheEntry>();
const inflightSavedStrategyRequests = new Map<string, Promise<CheckinStrategyKey[]>>();

function readCachedSavedStrategies(profileId: string | null): CheckinStrategyKey[] {
  if (!profileId) {
    return [];
  }

  return savedStrategyCache.get(profileId)?.savedStrategyKeys ?? [];
}

function writeCachedSavedStrategies(profileId: string, savedStrategyKeys: CheckinStrategyKey[]) {
  savedStrategyCache.set(profileId, {
    savedStrategyKeys: uniqueKeys(savedStrategyKeys),
    fetchedAt: Date.now(),
  });
}

function getShouldRefreshCache(profileId: string): boolean {
  const cached = savedStrategyCache.get(profileId);

  if (!cached) {
    return true;
  }

  return Date.now() - cached.fetchedAt > SAVED_STRATEGY_CACHE_TTL_MS;
}

async function fetchSavedStrategies(profileId: string): Promise<CheckinStrategyKey[]> {
  const existingRequest = inflightSavedStrategyRequests.get(profileId);

  if (existingRequest) {
    return existingRequest;
  }

  const nextRequest = (async () => {
    const response = await fetch(
      `/api/strategies/saved?profile_id=${encodeURIComponent(profileId)}`,
      {
        method: "GET",
      }
    );

    const payload = (await response.json().catch(() => null)) as SavedStrategiesResponse | null;

    if (!response.ok) {
      throw new Error(payload?.error ?? "Unable to load saved strategies.");
    }

    const savedStrategyKeys = Array.isArray(payload?.strategies)
      ? payload.strategies.map((strategy) => strategy.strategyKey)
      : [];

    writeCachedSavedStrategies(profileId, savedStrategyKeys);
    return savedStrategyKeys;
  })();

  inflightSavedStrategyRequests.set(profileId, nextRequest);

  try {
    return await nextRequest;
  } finally {
    inflightSavedStrategyRequests.delete(profileId);
  }
}

export function useProfileSavedStrategies({
  enabled,
  profileId,
  initialSavedStrategyKeys = [],
}: UseProfileSavedStrategiesInput) {
  const [savedStrategyKeys, setSavedStrategyKeys] = useState<CheckinStrategyKey[]>(() =>
    profileId
      ? uniqueKeys([
          ...readCachedSavedStrategies(profileId),
          ...initialSavedStrategyKeys,
        ])
      : []
  );
  const [pendingStrategyKeys, setPendingStrategyKeys] = useState<CheckinStrategyKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profileId) {
      return;
    }

    if (initialSavedStrategyKeys.length < 1) {
      return;
    }

    writeCachedSavedStrategies(profileId, initialSavedStrategyKeys);
  }, [initialSavedStrategyKeys, profileId]);

  useEffect(() => {
    if (!enabled || !profileId) {
      setSavedStrategyKeys([]);
      setPendingStrategyKeys([]);
      setIsLoading(false);
      setError("");
      return;
    }

    let isCancelled = false;
    const currentProfileId = profileId;
    const cachedKeys = readCachedSavedStrategies(currentProfileId);
    const shouldRefresh = getShouldRefreshCache(currentProfileId);

    setSavedStrategyKeys(
      uniqueKeys([
        ...cachedKeys,
        ...initialSavedStrategyKeys,
      ])
    );
    setError("");

    async function loadSavedStrategies() {
      if (!shouldRefresh && cachedKeys.length >= 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const nextSavedStrategyKeys = await fetchSavedStrategies(currentProfileId);

        if (isCancelled) {
          return;
        }

        setSavedStrategyKeys(nextSavedStrategyKeys);
      } catch (nextError) {
        if (!isCancelled) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "Saved strategies could not be loaded right now."
          );
          setSavedStrategyKeys(cachedKeys);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadSavedStrategies();

    return () => {
      isCancelled = true;
    };
  }, [enabled, initialSavedStrategyKeys, profileId]);

  async function setSavedState(
    strategyKey: CheckinStrategyKey,
    category: CheckinStrategyCategoryKey,
    shouldSave: boolean
  ) {
    if (!enabled || !profileId) {
      return { ok: false, error: "No profile selected." };
    }

    if (pendingStrategyKeys.includes(strategyKey)) {
      return { ok: false, error: null };
    }

    setError("");
    setPendingStrategyKeys((current) => [...current, strategyKey]);
    setSavedStrategyKeys((current) => {
      const nextSavedStrategyKeys = shouldSave
        ? uniqueKeys([...current, strategyKey])
        : current.filter((key) => key !== strategyKey);

      writeCachedSavedStrategies(profileId, nextSavedStrategyKeys);
      return nextSavedStrategyKeys;
    });

    try {
      const response = await fetch("/api/strategies/save", {
        method: shouldSave ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile_id: profileId,
          strategy_key: strategyKey,
          category,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to update this saved strategy.");
      }

      return { ok: true, error: null };
    } catch (nextError) {
      setSavedStrategyKeys((current) => {
        const nextSavedStrategyKeys = shouldSave
          ? current.filter((key) => key !== strategyKey)
          : uniqueKeys([...current, strategyKey]);

        writeCachedSavedStrategies(profileId, nextSavedStrategyKeys);
        return nextSavedStrategyKeys;
      });

      const message =
        nextError instanceof Error
          ? nextError.message
          : "We couldn't update this saved strategy right now.";

      setError(message);
      return { ok: false, error: message };
    } finally {
      setPendingStrategyKeys((current) => current.filter((key) => key !== strategyKey));
    }
  }

  const savedStrategyKeySet = useMemo(() => new Set(savedStrategyKeys), [savedStrategyKeys]);
  const pendingStrategyKeySet = useMemo(() => new Set(pendingStrategyKeys), [pendingStrategyKeys]);

  return {
    savedStrategyKeys,
    savedStrategyKeySet,
    pendingStrategyKeySet,
    isLoading,
    error,
    setError,
    setSavedState,
  };
}
