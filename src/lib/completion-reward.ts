export async function triggerCompletionReward(): Promise<boolean> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }
  if (window.localStorage.getItem("bft.classroomSafeMode") === "1") {
    return false;
  }

  try {
    const { default: confetti } = await import("canvas-confetti");

    const sharedConfig = {
      particleCount: 16,
      spread: 40,
      startVelocity: 20,
      ticks: 75,
      scalar: 0.82,
      gravity: 1.05,
      drift: 0,
      disableForReducedMotion: true,
      colors: ["#4F8CFF", "#7C6CFF", "#5ED3B3", "#F5FAFF"],
      zIndex: 1200,
    } as const;

    confetti({
      ...sharedConfig,
      angle: 65,
      origin: { x: 0.43, y: 0.78 },
    });
    confetti({
      ...sharedConfig,
      angle: 115,
      origin: { x: 0.57, y: 0.78 },
    });

    return true;
  } catch {
    return false;
  }
}
