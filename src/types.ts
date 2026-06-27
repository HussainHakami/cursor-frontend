export type AssetType = 'stock' | 'etf' | 'sukuk' | 'reit' | 'fund' | 'other';

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  currentPrice?: number;
  lastUpdated?: string;
}

export interface PortfolioSummary {
  totalInvested: number;
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  holdingsCount: number;
}

export interface AllocationSlice {
  name: string;
  value: number;
  color: string;
}

export const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: 'stock', label: 'أسهم' },
  { value: 'etf', label: 'صناديق مؤشرات' },
  { value: 'sukuk', label: 'صكوك' },
  { value: 'reit', label: 'صناديق عقارية' },
  { value: 'fund', label: 'صناديق استثمارية' },
  { value: 'other', label: 'أخرى' },
];

export const ALLOCATION_COLORS = [
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
];

export function computeHoldingValue(holding: Holding): number {
  const price = holding.currentPrice ?? holding.purchasePrice;
  return price * holding.quantity;
}

export function computeHoldingCost(holding: Holding): number {
  return holding.purchasePrice * holding.quantity;
}

export function computeHoldingGain(holding: Holding): { gain: number; gainPercent: number } {
  const cost = computeHoldingCost(holding);
  const value = computeHoldingValue(holding);
  const gain = value - cost;
  const gainPercent = cost > 0 ? (gain / cost) * 100 : 0;
  return { gain, gainPercent };
}

export function computePortfolioSummary(holdings: Holding[]): PortfolioSummary {
  const totalInvested = holdings.reduce((sum, h) => sum + computeHoldingCost(h), 0);
  const totalValue = holdings.reduce((sum, h) => sum + computeHoldingValue(h), 0);
  const totalGain = totalValue - totalInvested;
  const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
  return {
    totalInvested,
    totalValue,
    totalGain,
    totalGainPercent,
    holdingsCount: holdings.length,
  };
}

export function computeAllocation(holdings: Holding[]): AllocationSlice[] {
  const byType = new Map<string, number>();
  for (const h of holdings) {
    const value = computeHoldingValue(h);
    const label = ASSET_TYPES.find((t) => t.value === h.type)?.label ?? h.type;
    byType.set(label, (byType.get(label) ?? 0) + value);
  }
  return Array.from(byType.entries()).map(([name, value], i) => ({
    name,
    value,
    color: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length],
  }));
}

export function normalizeTadawulSymbol(symbol: string): string {
  const trimmed = symbol.trim().toUpperCase();
  if (trimmed.endsWith('.SR')) return trimmed;
  return `${trimmed}.SR`;
}
