import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "icon";

export function buttonClass({
  variant = "primary",
  size = "md",
  className
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "focus-ring pressable inline-flex items-center justify-center gap-2 rounded-md font-semibold transition disabled:pointer-events-none disabled:opacity-50",
    size === "sm" && "h-9 px-3 text-sm",
    size === "md" && "h-11 px-4 text-sm",
    size === "icon" && "h-10 w-10",
    variant === "primary" && "bg-brand-500 text-black shadow-sm hover:bg-amber-400 hover:shadow-md",
    variant === "secondary" && "border border-neutral-300 bg-white text-ink hover:border-neutral-400 hover:bg-neutral-50",
    variant === "ghost" && "text-neutral-700 hover:bg-neutral-100",
    variant === "danger" && "bg-ink text-white hover:bg-neutral-800 hover:shadow-md",
    className
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={buttonClass({ variant, size, className })} {...props} />;
}
