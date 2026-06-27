import { cn, formatCurrency, formatPercent } from "@/lib/utils";

interface GainLossBadgeProps {
  value: number;
  showIcon?: boolean;
  className?: string;
}

export function GainLossBadge({ value, showIcon = true, className }: GainLossBadgeProps) {
  const isPositive = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg px-2 py-0.5 text-xs font-semibold",
        isPositive
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
        className
      )}
    >
      {showIcon && (isPositive ? "▲" : "▼")}
      {formatPercent(value)}
    </span>
  );
}

interface PriceChangeProps {
  current: number;
  previous: number;
  className?: string;
}

export function PriceChange({ current, previous, className }: PriceChangeProps) {
  const change = current - previous;
  const changePercent = previous > 0 ? (change / previous) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <div className={cn("flex flex-col items-end", className)}>
      <span className="font-semibold text-gray-900 dark:text-white">
        {formatCurrency(current)}
      </span>
      <span
        className={cn(
          "text-xs font-medium",
          isPositive ? "text-emerald-600" : "text-red-500"
        )}
      >
        {isPositive ? "+" : ""}
        {change.toFixed(2)} ({formatPercent(changePercent)})
      </span>
    </div>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center p-12", className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
      <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">{title}</p>
      {description && (
        <p className="mt-2 text-sm text-gray-400">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
