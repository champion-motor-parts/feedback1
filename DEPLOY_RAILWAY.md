import * as React from "react";
import { cn } from "@/lib/utils";

const toneClass = {
  neutral: "bg-neutral-100 text-neutral-700",
  red: "bg-brand-50 text-brand-700",
  green: "bg-emerald-50 text-emerald-700",
  blue: "bg-blue-50 text-blue-700",
  amber: "bg-amber-50 text-amber-800"
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: keyof typeof toneClass;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-md px-2.5 py-1 text-xs font-semibold",
        toneClass[tone],
        className
      )}
      {...props}
    />
  );
}
