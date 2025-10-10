"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Seal = ({
  text = "Confirmado",
  className,
}: {
  text?: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border bg-green-100 px-2 py-1 text-xs font-semibold text-green-800",
        className
      )}
    >
      <Check className="h-3.5 w-3.5" />
      <span>{text}</span>
    </div>
  );
};
