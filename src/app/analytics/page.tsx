"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/StatsCard";
import {
  SectorPieChart,
  PerformanceLineChart,
  HoldingsBarChart,
} from "@/components/Charts";
import { LoadingSpinner, GainLossBadge, EmptyState } from "@/components/ui";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { BarChart3, TrendingUp, PieChart, DollarSign } from "lucide-react";

interface AnalyticsData {
  summary: {
    totalMarketValue: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    holdingsCount: number;
    metrics: {
      symbol: string;
      nameAr: string;
      sector: string;
      marketValue: number;
      gainLoss: number;
      gainLossPercent: number;
      weight: number;
    }[];
  };
  sectorData: { name: string; value: number; color: string; percent: number }[];
  topStocks: {
    symbol: string;
    nameAr: string;
    sector: string;
    currentPrice: number;
    previousClose: number;
    marketCap: number;
    pe: number | null;
    dividendYield: number | null;
  }[];
  dividends: {
    id: string;
    amount: number;
    date: string;
    stock: { nameAr: string; symbol: string };
  }[];
  monthlyPerformance: { month: string; value: number }[];
  holdingsByPerformance: {
    symbol: string;
    nameAr: string;
    gainLossPercent: number;
    marketValue: number;
    gainLoss: number;
  }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <EmptyState title="فشل في تحميل التحليلات" />;

  const barData = data.summary.metrics
    .sort((a, b) => b.marketValue - a.marketValue)
    .slice(0, 8)
    .map((m) => ({
      name: m.nameAr.length > 12 ? m.nameAr.slice(0, 12) + "..." : m.nameAr,
      value: m.marketValue,
      gainLoss: m.gainLoss,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">التحليلات</h1>
        <p className="mt-1 text-sm text-gray-500">تحليل شامل لأداء استثماراتك</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="القيمة الإجمالية"
          value={formatCurrency(data.summary.totalMarketValue)}
          icon={BarChart3}
          iconColor="bg-emerald-600"
        />
        <StatsCard
          title="إجمالي العائد"
          value={formatCurrency(data.summary.totalGainLoss)}
          change={data.summary.totalGainLossPercent}
          icon={TrendingUp}
          iconColor={data.summary.totalGainLoss >= 0 ? "bg-emerald-600" : "bg-red-500"}
        />
        <StatsCard
          title="عدد الأسهم"
          value={String(data.summary.holdingsCount)}
          icon={PieChart}
          iconColor="bg-blue-600"
        />
        <StatsCard
          title="عدد القطاعات"
          value={String(data.sectorData.length)}
          icon={DollarSign}
          iconColor="bg-amber-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            أداء المحفظة الشهري
          </h2>
          <PerformanceLineChart data={data.monthlyPerformance} />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            توزيع القطاعات
          </h2>
          <SectorPieChart data={data.sectorData} />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          أكبر الحيازات حسب القيمة
        </h2>
        <HoldingsBarChart data={barData} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            أداء الأسهم
          </h2>
          <div className="space-y-2">
            {data.holdingsByPerformance.map((h, i) => (
              <div
                key={h.symbol}
                className="flex items-center justify-between rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold dark:bg-gray-800">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{h.nameAr}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(h.marketValue)}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className={`font-semibold ${h.gainLoss >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {formatCurrency(h.gainLoss)}
                  </p>
                  <GainLossBadge value={h.gainLossPercent} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            آخر التوزيعات
          </h2>
          <div className="space-y-2">
            {data.dividends.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {d.stock.nameAr}
                  </p>
                  <p className="text-xs text-gray-500">
                    {d.stock.symbol} • {formatShortDate(d.date)}
                  </p>
                </div>
                <p className="font-bold text-amber-600">{formatCurrency(d.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          أكبر الشركات في السوق
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="p-3 text-right font-medium text-gray-500">الشركة</th>
                <th className="p-3 text-right font-medium text-gray-500">القطاع</th>
                <th className="p-3 text-right font-medium text-gray-500">السعر</th>
                <th className="p-3 text-right font-medium text-gray-500">التغير</th>
                <th className="p-3 text-right font-medium text-gray-500">مكرر الربحية</th>
                <th className="p-3 text-right font-medium text-gray-500">التوزيعات</th>
              </tr>
            </thead>
            <tbody>
              {data.topStocks.map((stock) => {
                const change =
                  ((stock.currentPrice - stock.previousClose) / stock.previousClose) * 100;
                return (
                  <tr
                    key={stock.symbol}
                    className="border-b border-gray-50 dark:border-gray-800"
                  >
                    <td className="p-3 font-semibold">{stock.nameAr}</td>
                    <td className="p-3 text-gray-500">{stock.sector}</td>
                    <td className="p-3">{formatCurrency(stock.currentPrice)}</td>
                    <td className="p-3">
                      <GainLossBadge value={change} />
                    </td>
                    <td className="p-3">{stock.pe || "—"}</td>
                    <td className="p-3">
                      {stock.dividendYield ? `${stock.dividendYield}%` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
