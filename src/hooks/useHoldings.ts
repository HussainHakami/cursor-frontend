import { useCallback, useEffect, useState } from 'react';
import type { Holding } from '../types';
import { loadHoldings, saveHoldings } from '../lib/storage';
import { fetchPrices } from '../lib/prices';

export function useHoldings() {
  const [holdings, setHoldings] = useState<Holding[]>(() => loadHoldings());
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    saveHoldings(holdings);
  }, [holdings]);

  const addHolding = useCallback((holding: Omit<Holding, 'id'>) => {
    setHoldings((prev) => [...prev, { ...holding, id: crypto.randomUUID() }]);
  }, []);

  const updateHolding = useCallback((id: string, updates: Partial<Holding>) => {
    setHoldings((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    );
  }, []);

  const deleteHolding = useCallback((id: string) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const refreshPrices = useCallback(async () => {
    if (holdings.length === 0) return;
    setRefreshing(true);
    try {
      const prices = await fetchPrices(
        holdings.map((h) => ({ symbol: h.symbol, type: h.type, id: h.id })),
      );
      const now = new Date().toISOString();
      setHoldings((prev) =>
        prev.map((h) => {
          const price = prices.get(h.id);
          if (price === undefined) return h;
          return { ...h, currentPrice: price, lastUpdated: now };
        }),
      );
      setLastRefresh(new Date());
    } finally {
      setRefreshing(false);
    }
  }, [holdings]);

  return {
    holdings,
    addHolding,
    updateHolding,
    deleteHolding,
    refreshPrices,
    refreshing,
    lastRefresh,
  };
}
