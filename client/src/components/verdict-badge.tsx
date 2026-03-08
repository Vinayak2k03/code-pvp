import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, AlertTriangle, Ban } from "lucide-react";

type VerdictType =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "RUNTIME_ERROR"
  | "COMPILATION_ERROR"
  | "PENDING";

interface VerdictBadgeProps {
  verdict: VerdictType;
  className?: string;
}

const verdictConfig: Record<VerdictType, { label: string; icon: any; class: string }> = {
  ACCEPTED: {
    label: "Accepted",
    icon: CheckCircle2,
    class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  WRONG_ANSWER: {
    label: "Wrong Answer",
    icon: XCircle,
    class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  TIME_LIMIT_EXCEEDED: {
    label: "Time Limit",
    icon: Clock,
    class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  RUNTIME_ERROR: {
    label: "Runtime Error",
    icon: AlertTriangle,
    class: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  COMPILATION_ERROR: {
    label: "Compile Error",
    icon: Ban,
    class: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  },
  PENDING: {
    label: "Pending",
    icon: Clock,
    class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
};

export function VerdictBadge({ verdict, className }: VerdictBadgeProps) {
  const config = verdictConfig[verdict];
  const Icon = config.icon;

  return (
    <Badge className={cn("border-0 gap-1", config.class, className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
