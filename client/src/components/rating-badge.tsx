import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface RatingBadgeProps {
  rating: number;
  className?: string;
  showLabel?: boolean;
}

function getRatingTier(rating: number): {
  label: string;
  color: string;
  bgClass: string;
} {
  if (rating >= 2400) return { label: "Grandmaster", color: "text-red-500", bgClass: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" };
  if (rating >= 2100) return { label: "Master", color: "text-orange-500", bgClass: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" };
  if (rating >= 1800) return { label: "Expert", color: "text-violet-500", bgClass: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400" };
  if (rating >= 1500) return { label: "Specialist", color: "text-cyan-500", bgClass: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400" };
  if (rating >= 1200) return { label: "Apprentice", color: "text-green-500", bgClass: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" };
  return { label: "Newbie", color: "text-muted-foreground", bgClass: "bg-muted text-muted-foreground" };
}

export function RatingBadge({ rating, className, showLabel = true }: RatingBadgeProps) {
  const tier = getRatingTier(rating);

  return (
    <Badge className={cn("border-0", tier.bgClass, className)}>
      {rating}
      {showLabel && <span className="ml-1 opacity-75">· {tier.label}</span>}
    </Badge>
  );
}

export function RatingDisplay({ rating }: { rating: number }) {
  const tier = getRatingTier(rating);
  return <span className={cn("font-semibold tabular-nums", tier.color)}>{rating}</span>;
}

export function RatingDelta({ delta }: { delta: number }) {
  if (delta === 0) return <span className="text-muted-foreground">±0</span>;
  return (
    <span className={cn("font-medium tabular-nums", delta > 0 ? "text-emerald-500" : "text-red-500")}>
      {delta > 0 ? `+${delta}` : delta}
    </span>
  );
}
