import { formatCurrency, formatPercent } from '../lib/format';
import { cn } from '../lib/format';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ label, value, subValue, trend }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised p-5">
      <p className="text-sm font-medium text-text-secondary">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      {subValue && (
        <p
          className={cn(
            'mt-1 text-sm font-medium',
            trend === 'up' && 'text-accent',
            trend === 'down' && 'text-danger',
            trend === 'neutral' && 'text-text-secondary',
          )}
        >
          {subValue}
        </p>
      )}
    </div>
  );
}

interface PortfolioStatsProps {
  totalValue: number;
  totalInvested: number;
  totalGain: number;
  totalGainPercent: number;
  holdingsCount: number;
}

export function PortfolioStats({
  totalValue,
  totalInvested,
  totalGain,
  totalGainPercent,
  holdingsCount,
}: PortfolioStatsProps) {
  const trend = totalGain >= 0 ? 'up' : 'down';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Portfolio Value" value={formatCurrency(totalValue)} />
      <StatCard label="Total Invested" value={formatCurrency(totalInvested)} />
      <StatCard
        label="Total Gain / Loss"
        value={formatCurrency(totalGain)}
        subValue={formatPercent(totalGainPercent)}
        trend={trend}
      />
      <StatCard
        label="Holdings"
        value={String(holdingsCount)}
        subValue={holdingsCount === 1 ? '1 position' : `${holdingsCount} positions`}
        trend="neutral"
      />
    </div>
  );
}
