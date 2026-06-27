"use client";

import { useEffect, useState } from "react";
import { Search, Eye, TrendingUp } from "lucide-react";
import { LoadingSpinner, GainLossBadge, PriceChange, EmptyState } from "@/components/ui";
import { inputClass, buttonPrimaryClass } from "@/components/Modal";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { SECTORS } from "@/lib/stocks";

interface Stock {
  id: string;
  symbol: string;
  nameAr: string;
  nameEn: string;
  sector: string;
  currentPrice: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  marketCap: number;
  pe: number | null;
  dividendYield: number | null;
}

export default function StocksPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("");

  const fetchStocks = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (sector) params.set("sector", sector);

    setLoading(true);
    fetch(`/api/stocks?${params}`)
      .then((r) => r.json())
      .then(setStocks)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(fetchStocks, 300);
    return () => clearTimeout(timer);
  }, [search, sector]);

  const handleAddToWatchlist = async (stockId: string) => {
    await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockId }),
    });
    alert("تمت الإضافة لقائمة المراقبة");
  };

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `${(cap / 1e12).toFixed(1)} تريليون`;
    if (cap >= 1e9) return `${(cap / 1e9).toFixed(1)} مليار`;
    if (cap >= 1e6) return `${(cap / 1e6).toFixed(1)} مليون`;
    return formatNumber(cap, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">أسهم السوق السعودي</h1>
        <p className="mt-1 text-sm text-gray-500">تصفح أسهم تداول ومتابعة أسعارها</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            className={`${inputClass} pr-10`}
            placeholder="بحث بالرمز أو الاسم..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className={`${inputClass} sm:w-48`}
          value={sector}
          onChange={(e) => setSector(e.target.value)}
        >
          <option value="">جميع القطاعات</option>
          {SECTORS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : stocks.length === 0 ? (
        <EmptyState title="لا توجد نتائج" description="جرب تغيير معايير البحث" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                <th className="p-4 text-right font-medium text-gray-500">السهم</th>
                <th className="p-4 text-right font-medium text-gray-500">القطاع</th>
                <th className="p-4 text-right font-medium text-gray-500">السعر</th>
                <th className="p-4 text-right font-medium text-gray-500">أعلى/أدنى</th>
                <th className="p-4 text-right font-medium text-gray-500">الحجم</th>
                <th className="p-4 text-right font-medium text-gray-500">القيمة السوقية</th>
                <th className="p-4 text-right font-medium text-gray-500">مكرر الربحية</th>
                <th className="p-4 text-right font-medium text-gray-500">التوزيعات</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => {
                const changePercent =
                  ((stock.currentPrice - stock.previousClose) / stock.previousClose) * 100;
                return (
                  <tr
                    key={stock.id}
                    className="border-b border-gray-50 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{stock.nameAr}</p>
                          <p className="text-xs text-gray-500">{stock.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
                        {stock.sector}
                      </span>
                    </td>
                    <td className="p-4">
                      <PriceChange current={stock.currentPrice} previous={stock.previousClose} />
                    </td>
                    <td className="p-4 text-xs text-gray-500">
                      <p>{formatCurrency(stock.dayHigh)}</p>
                      <p>{formatCurrency(stock.dayLow)}</p>
                    </td>
                    <td className="p-4 text-gray-600">{formatNumber(stock.volume, 0)}</td>
                    <td className="p-4 text-gray-600">{formatMarketCap(stock.marketCap)}</td>
                    <td className="p-4">{stock.pe ? formatNumber(stock.pe) : "—"}</td>
                    <td className="p-4">
                      {stock.dividendYield ? (
                        <span className="text-emerald-600">{formatNumber(stock.dividendYield)}%</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleAddToWatchlist(stock.id)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"
                        title="إضافة للمراقبة"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
