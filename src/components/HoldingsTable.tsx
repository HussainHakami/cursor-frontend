import type { Holding } from '../types';
import { computeHoldingGain, computeHoldingValue } from '../types';
import { formatCurrency, formatPercent, cn } from '../lib/format';
import { TypeBadge } from './HoldingForm';

interface HoldingsTableProps {
  holdings: Holding[];
  onEdit: (holding: Holding) => void;
  onDelete: (id: string) => void;
}

export function HoldingsTable({ holdings, onEdit, onDelete }: HoldingsTableProps) {
  if (holdings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-surface-overlay p-4">
          <svg className="h-8 w-8 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <p className="text-lg font-medium">No holdings yet</p>
        <p className="mt-1 text-sm text-text-secondary">
          Add your first investment to start tracking your portfolio
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-text-secondary">
            <th className="pb-3 pr-4 font-medium">Asset</th>
            <th className="pb-3 pr-4 font-medium">Type</th>
            <th className="pb-3 pr-4 font-medium text-right">Qty</th>
            <th className="pb-3 pr-4 font-medium text-right">Avg Cost</th>
            <th className="pb-3 pr-4 font-medium text-right">Price</th>
            <th className="pb-3 pr-4 font-medium text-right">Value</th>
            <th className="pb-3 pr-4 font-medium text-right">Gain/Loss</th>
            <th className="pb-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => {
            const { gain, gainPercent } = computeHoldingGain(holding);
            const value = computeHoldingValue(holding);
            const currentPrice = holding.currentPrice ?? holding.purchasePrice;
            const isPositive = gain >= 0;

            return (
              <tr key={holding.id} className="border-b border-border/50 transition hover:bg-surface-overlay/30">
                <td className="py-3 pr-4">
                  <div>
                    <span className="font-medium">{holding.symbol}</span>
                    <p className="text-xs text-text-secondary">{holding.name}</p>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <TypeBadge type={holding.type} />
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">{holding.quantity}</td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  {formatCurrency(holding.purchasePrice)}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  {formatCurrency(currentPrice)}
                  {holding.currentPrice && (
                    <p className="text-xs text-text-secondary">live</p>
                  )}
                </td>
                <td className="py-3 pr-4 text-right font-medium tabular-nums">
                  {formatCurrency(value)}
                </td>
                <td className={cn('py-3 pr-4 text-right tabular-nums', isPositive ? 'text-accent' : 'text-danger')}>
                  <div>{formatCurrency(gain)}</div>
                  <div className="text-xs">{formatPercent(gainPercent)}</div>
                </td>
                <td className="py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => onEdit(holding)}
                      className="rounded-md p-1.5 text-text-secondary transition hover:bg-surface-overlay hover:text-text-primary"
                      title="Edit"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(holding.id)}
                      className="rounded-md p-1.5 text-text-secondary transition hover:bg-danger/20 hover:text-danger"
                      title="Delete"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function TopHoldings({ holdings }: { holdings: Holding[] }) {
  const sorted = [...holdings]
    .sort((a, b) => computeHoldingValue(b) - computeHoldingValue(a))
    .slice(0, 5);

  if (sorted.length === 0) return null;

  const maxValue = computeHoldingValue(sorted[0]);

  return (
    <div className="space-y-3">
      {sorted.map((h) => {
        const value = computeHoldingValue(h);
        const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
        const { gainPercent } = computeHoldingGain(h);

        return (
          <div key={h.id}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium">{h.symbol}</span>
              <span className="text-text-secondary">{formatCurrency(value)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-overlay">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className={cn('mt-0.5 text-xs', gainPercent >= 0 ? 'text-accent' : 'text-danger')}>
              {formatPercent(gainPercent)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
