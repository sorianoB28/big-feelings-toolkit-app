"use client";

import { useEffect } from "react";
import { toast } from "sonner";

type FlashToastProps = {
  message: string;
  tone?: "success" | "error";
  durationMs?: number;
};

export function FlashToast({ message, tone = "success", durationMs = 4000 }: FlashToastProps) {
  useEffect(() => {
    if (!message) {
      return;
    }

    const toastId = `${tone}:${message}`;

    if (tone === "error") {
      toast.error(message, { duration: durationMs, id: toastId });
      return;
    }

    toast.success(message, { duration: durationMs, id: toastId });
  }, [durationMs, message, tone]);

  return null;
}
