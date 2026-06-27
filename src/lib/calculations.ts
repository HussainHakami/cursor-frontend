export interface HoldingWithStock {
  id: string;
  quantity: number;
  avgBuyPrice: number;
  stock: {
    id: string;
    symbol: string;
    nameAr: string;
    nameEn: string;
    sector: string;
    currentPrice: number;
    previousClose: number;
  };
}

export interface HoldingMetrics {
  id: string;
  symbol: string;
  nameAr: string;
  sector: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  costBasis: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  weight: number;
}

export function calculateHoldingMetrics(
  holding: HoldingWithStock,
  totalMarketValue: number
): HoldingMetrics {
  const { stock, quantity, avgBuyPrice } = holding;
  const costBasis = quantity * avgBuyPrice;
  const marketValue = quantity * stock.currentPrice;
  const gainLoss = marketValue - costBasis;
  const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
  const dayChange = quantity * (stock.currentPrice - stock.previousClose);
  const dayChangePercent =
    stock.previousClose > 0
      ? ((stock.currentPrice - stock.previousClose) / stock.previousClose) * 100
      : 0;
  const weight = totalMarketValue > 0 ? (marketValue / totalMarketValue) * 100 : 0;

  return {
    id: holding.id,
    symbol: stock.symbol,
    nameAr: stock.nameAr,
    sector: stock.sector,
    quantity,
    avgBuyPrice,
    currentPrice: stock.currentPrice,
    costBasis,
    marketValue,
    gainLoss,
    gainLossPercent,
    dayChange,
    dayChangePercent,
    weight,
  };
}

export function calculatePortfolioSummary(holdings: HoldingWithStock[]) {
  const totalMarketValue = holdings.reduce(
    (sum, h) => sum + h.quantity * h.stock.currentPrice,
    0
  );

  const metrics = holdings.map((h) =>
    calculateHoldingMetrics(h, totalMarketValue)
  );

  const totalCostBasis = metrics.reduce((sum, m) => sum + m.costBasis, 0);
  const totalGainLoss = totalMarketValue - totalCostBasis;
  const totalGainLossPercent =
    totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;
  const dayChange = metrics.reduce((sum, m) => sum + m.dayChange, 0);
  const dayChangePercent =
    totalMarketValue - dayChange > 0
      ? (dayChange / (totalMarketValue - dayChange)) * 100
      : 0;

  const sectorAllocation = metrics.reduce(
    (acc, m) => {
      acc[m.sector] = (acc[m.sector] || 0) + m.marketValue;
      return acc;
    },
    {} as Record<string, number>
  );

  const topGainers = [...metrics]
    .sort((a, b) => b.gainLossPercent - a.gainLossPercent)
    .slice(0, 5);

  const topLosers = [...metrics]
    .sort((a, b) => a.gainLossPercent - b.gainLossPercent)
    .slice(0, 5);

  return {
    totalMarketValue,
    totalCostBasis,
    totalGainLoss,
    totalGainLossPercent,
    dayChange,
    dayChangePercent,
    holdingsCount: holdings.length,
    metrics,
    sectorAllocation,
    topGainers,
    topLosers,
  };
}

export const SECTOR_COLORS: Record<string, string> = {
  "الطاقة": "#006C35",
  "البنوك": "#1B4D89",
  "المواد الأساسية": "#C4A35A",
  "الاتصالات": "#7B2D8E",
  "النقل": "#E65100",
  "الأغذية": "#2E7D32",
  "المرافق": "#0277BD",
  "الإسمنت": "#795548",
  "التأمين": "#00838F",
  "التجزئة": "#AD1457",
  "الرعاية الصحية": "#D32F2F",
  "العقارات": "#5D4037",
};

export const CHART_COLORS = [
  "#006C35",
  "#1B4D89",
  "#C4A35A",
  "#7B2D8E",
  "#E65100",
  "#2E7D32",
  "#0277BD",
  "#795548",
  "#00838F",
  "#AD1457",
];
