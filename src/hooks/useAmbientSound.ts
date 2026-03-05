"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AmbientSoundType = "rain" | "white_noise";

type UseAmbientSoundOptions = {
  enabled?: boolean;
  volume?: number;
  soundType?: AmbientSoundType;
};

const SOUND_SOURCES: Record<AmbientSoundType, string> = {
  rain: "/audio/rain.mp3",
  white_noise: "/audio/white-noise.mp3",
};

function clampVolume(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function useAmbientSound(options: UseAmbientSoundOptions = {}) {
  const [enabled, setEnabled] = useState(options.enabled ?? false);
  const [volume, setVolume] = useState(clampVolume(options.volume ?? 0.25));
  const [soundType, setSoundType] = useState<AmbientSoundType>(options.soundType ?? "rain");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const ensureAudio = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }

    if (!audioRef.current) {
      const audio = new Audio(SOUND_SOURCES[soundType]);
      audio.loop = true;
      audio.preload = "none";
      audio.volume = volume;
      audioRef.current = audio;
    }

    return audioRef.current;
  }, [soundType, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const nextSource = SOUND_SOURCES[soundType];
    if (audio.src.endsWith(nextSource)) {
      return;
    }

    const shouldResume = !audio.paused;
    audio.pause();
    audio.src = nextSource;
    audio.load();

    if (shouldResume) {
      void audio.play().catch(() => undefined);
    }
  }, [soundType]);

  useEffect(() => {
    const audio = enabled ? ensureAudio() : audioRef.current;
    if (!audio) {
      return;
    }

    if (enabled) {
      void audio.play().catch(() => undefined);
      return;
    }

    audio.pause();
  }, [enabled, ensureAudio]);

  useEffect(() => {
    return () => {
      if (!audioRef.current) {
        return;
      }

      audioRef.current.pause();
      audioRef.current = null;
    };
  }, []);

  const toggleEnabled = useCallback(() => {
    setEnabled((current) => !current);
  }, []);

  return {
    enabled,
    volume,
    soundType,
    setEnabled,
    toggleEnabled,
    setVolume,
    setSoundType,
  };
}

