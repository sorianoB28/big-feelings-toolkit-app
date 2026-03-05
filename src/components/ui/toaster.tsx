"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      closeButton
      richColors
      toastOptions={{
        duration: 4200,
        classNames: {
          toast: "border border-border-soft bg-white text-dark shadow-lg",
          title: "text-sm font-medium",
          description: "text-sm text-gray-700",
          actionButton: "bg-primary text-white",
          cancelButton: "bg-gray-100 text-dark",
          closeButton: "bg-white text-dark border border-gray-200",
        },
      }}
    />
  );
}
