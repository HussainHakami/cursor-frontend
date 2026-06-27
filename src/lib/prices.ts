import { normalizeTadawulSymbol } from '../types';

function resolveSymbol(symbol: string): string {
  return normalizeTadawulSymbol(symbol);
}

export interface PriceResult {
  price: number;
  symbol: string;
}

export async function fetchPrice(symbol: string): Promise<PriceResult> {
  const yahooSymbol = resolveSymbol(symbol);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`تعذر جلب السعر لـ ${symbol}`);
  }

  const data = await response.json();
  const result = data?.chart?.result?.[0];
  const price = result?.meta?.regularMarketPrice;

  if (typeof price !== 'number') {
    throw new Error(`لا توجد بيانات سعر لـ ${symbol}`);
  }

  return { price, symbol: yahooSymbol };
}

export async function fetchPrices(
  items: { symbol: string; id: string }[],
): Promise<Map<string, number>> {
  const results = new Map<string, number>();
  const batchSize = 5;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const promises = batch.map(async (item) => {
      try {
        const { price } = await fetchPrice(item.symbol);
        results.set(item.id, price);
      } catch {
        // skip failed fetches
      }
    });
    await Promise.all(promises);
  }

  return results;
}
