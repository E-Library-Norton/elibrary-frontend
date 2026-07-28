import { CheckCircle2, Clock3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ReadingProgressBarProps {
  currentPage: number;
  totalPages: number;
  lastReadAt?: string | null;
  compact?: boolean;
  className?: string;
}

export function ReadingProgressBar({
  currentPage,
  totalPages,
  lastReadAt,
  compact = false,
  className,
}: ReadingProgressBarProps) {
  const percentage =
    totalPages > 0
      ? Math.min(100, Math.round((currentPage / totalPages) * 100))
      : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          Page {currentPage} of {totalPages || "—"}
        </span>
        <span className="flex items-center gap-1 font-semibold text-[#20659C] dark:text-sky-400">
          {percentage === 100 && <CheckCircle2 className="h-3.5 w-3.5" />}
          {percentage}% Completed
        </span>
      </div>
      <Progress value={percentage} className={compact ? "h-1.5" : "h-2"} />
      {!compact && lastReadAt && (
        <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Clock3 className="h-3.5 w-3.5" />
          Last read {new Date(lastReadAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}
