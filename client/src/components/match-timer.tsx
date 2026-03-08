"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MatchTimerProps {
  endTime: number; // absolute ms timestamp when match ends
  onTimeUp?: () => void;
  className?: string;
}

export function MatchTimer({
  endTime,
  onTimeUp,
  className,
}: MatchTimerProps) {
  const [timeLeft, setTimeLeft] = useState(() =>
    Math.max(0, Math.floor((endTime - Date.now()) / 1000))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onTimeUp?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLow = timeLeft < 60;
  const isCritical = timeLeft < 30;

  return (
    <div
      className={cn(
        "font-mono text-lg font-semibold tabular-nums",
        isCritical
          ? "text-red-500 animate-pulse-slow"
          : isLow
            ? "text-amber-500"
            : "text-foreground",
        className
      )}
    >
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  );
}
