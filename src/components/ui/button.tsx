import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClassNames: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-dark",
  secondary:
    "border border-gray-300 bg-white text-dark shadow-sm hover:bg-gray-100",
};

const sizeClassNames: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 py-1.5 text-sm",
  md: "min-h-11 px-5 py-2 text-sm",
  lg: "min-h-12 px-6 py-2.5 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition duration-[250ms] ease-out motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
          variantClassNames[variant],
          sizeClassNames[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
