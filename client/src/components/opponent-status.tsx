"use client";

import { cn } from "@/lib/utils";

interface OpponentStatusProps {
  status: string;
  username: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; dotClass: string }> = {
  idle: { label: "Idle", dotClass: "bg-muted-foreground" },
  typing: { label: "Coding...", dotClass: "bg-blue-500 animate-pulse" },
  running: { label: "Running code", dotClass: "bg-amber-500 animate-pulse" },
  submitted: { label: "Submitted!", dotClass: "bg-violet-500 animate-pulse" },
  solved: { label: "Solved! 🎉", dotClass: "bg-emerald-500" },
  "wrong-answer": { label: "Wrong Answer", dotClass: "bg-red-500" },
};

export function OpponentStatus({
  status,
  username,
  className,
}: OpponentStatusProps) {
  const config = statusConfig[status] || statusConfig.idle;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("h-2 w-2 rounded-full", config.dotClass)} />
      <span className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{username}</span>
        {" · "}
        {config.label}
      </span>
    </div>
  );
}
