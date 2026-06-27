const CRYPTO_SUFFIX: Record<string, string> = {
  BTC: 'BTC-USD',
  ETH: 'ETH-USD',
  SOL: 'SOL-USD',
  DOGE: 'DOGE-USD',
  ADA: 'ADA-USD',
  XRP: 'XRP-USD',
  DOT: 'DOT-USD',
  AVAX: 'AVAX-USD',
  LINK: 'LINK-USD',
  MATIC: 'MATIC-USD',
};

function resolveSymbol(symbol: string, type: string): string {
  const upper = symbol.toUpperCase().trim();
  if (type === 'crypto') {
    return CRYPTO_SUFFIX[upper] ?? `${upper}-USD`;
  }
  return upper;
}

export interface PriceResult {
  price: number;
  symbol: string;
}

export async function fetchPrice(
  symbol: string,
  type: string,
): Promise<PriceResult> {
  const yahooSymbol = resolveSymbol(symbol, type);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch price for ${symbol}`);
  }

  const data = await response.json();
  const result = data?.chart?.result?.[0];
  const price = result?.meta?.regularMarketPrice;

  if (typeof price !== 'number') {
    throw new Error(`No price data found for ${symbol}`);
  }

  return { price, symbol: yahooSymbol };
}

export async function fetchPrices(
  items: { symbol: string; type: string; id: string }[],
): Promise<Map<string, number>> {
  const results = new Map<string, number>();
  const batchSize = 5;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const promises = batch.map(async (item) => {
      try {
        const { price } = await fetchPrice(item.symbol, item.type);
        results.set(item.id, price);
      } catch {
        // skip failed fetches
      }
    });
    await Promise.all(promises);
  }

  return results;
}
