import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: "EASY" | "MEDIUM" | "HARD";
  className?: string;
}

const difficultyConfig = {
  EASY: {
    label: "Easy",
    class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0",
  },
  MEDIUM: {
    label: "Medium",
    class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0",
  },
  HARD: {
    label: "Hard",
    class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0",
  },
};

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty];
  return (
    <Badge className={cn(config.class, className)}>
      {config.label}
    </Badge>
  );
}
