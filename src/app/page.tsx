"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart,
  Activity,
  DollarSign,
} from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { SectorPieChart, PerformanceLineChart } from "@/components/Charts";
import { LoadingSpinner, GainLossBadge, EmptyState } from "@/components/ui";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import Link from "next/link";

interface DashboardData {
  summary: {
    totalMarketValue: number;
    totalCostBasis: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    dayChange: number;
    dayChangePercent: number;
    holdingsCount: number;
    topGainers: { symbol: string; nameAr: string; gainLossPercent: number }[];
    topLosers: { symbol: string; nameAr: string; gainLossPercent: number }[];
  };
  sectorData: { name: string; value: number; color: string; percent: number }[];
  recentTransactions: {
    id: string;
    type: string;
    quantity: number;
    price: number;
    date: string;
    stock: { symbol: string; nameAr: string };
    portfolio: { name: string };
  }[];
  marketOverview: {
    symbol: string;
    nameAr: string;
    currentPrice: number;
    previousClose: number;
    volume: number;
  }[];
  watchlistCount: number;
  totalDividends: number;
  portfolioBreakdown: {
    id: string;
    name: string;
    color: string;
    value: number;
    gainLossPercent: number;
  }[];
  portfoliosCount: number;
}

const transactionTypeLabels: Record<string, string> = {
  BUY: "شراء",
  SELL: "بيع",
  DIVIDEND: "توزيعات",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <EmptyState title="فشل في تحميل البيانات" />;

  const { summary } = data;
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const factor = 0.9 + i * 0.02;
    return {
      month: date.toLocaleDateString("ar-SA", { month: "short" }),
      value: summary.totalMarketValue * factor,
    };
  });
  monthlyData[monthlyData.length - 1].value = summary.totalMarketValue;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">لوحة التحكم</h1>
        <p className="mt-1 text-sm text-gray-500">نظرة شاملة على استثماراتك في السوق السعودي</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="إجمالي قيمة المحفظة"
          value={formatCurrency(summary.totalMarketValue)}
          change={summary.totalGainLossPercent}
          changeLabel="إجمالي العائد"
          icon={Wallet}
          iconColor="bg-emerald-600"
        />
        <StatsCard
          title="الربح / الخسارة"
          value={formatCurrency(summary.totalGainLoss)}
          change={summary.dayChangePercent}
          changeLabel="تغير اليوم"
          icon={summary.totalGainLoss >= 0 ? TrendingUp : TrendingDown}
          iconColor={summary.totalGainLoss >= 0 ? "bg-emerald-600" : "bg-red-500"}
        />
        <StatsCard
          title="تغير اليوم"
          value={formatCurrency(summary.dayChange)}
          subtitle={`${summary.holdingsCount} سهم في ${data.portfoliosCount} محافظ`}
          icon={Activity}
          iconColor="bg-blue-600"
        />
        <StatsCard
          title="إجمالي التوزيعات"
          value={formatCurrency(data.totalDividends)}
          subtitle={`${data.watchlistCount} سهم في المراقبة`}
          icon={DollarSign}
          iconColor="bg-amber-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            أداء المحفظة
          </h2>
          <PerformanceLineChart data={monthlyData} />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <PieChart className="h-5 w-5 text-emerald-600" />
            توزيع القطاعات
          </h2>
          <SectorPieChart data={data.sectorData} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-bold text-emerald-700">أفضل الأداء</h2>
          <div className="space-y-3">
            {summary.topGainers.map((stock) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 dark:bg-emerald-900/20"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{stock.nameAr}</p>
                  <p className="text-xs text-gray-500">{stock.symbol}</p>
                </div>
                <GainLossBadge value={stock.gainLossPercent} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-bold text-red-600">أقل الأداء</h2>
          <div className="space-y-3">
            {summary.topLosers.map((stock) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between rounded-xl bg-red-50 p-3 dark:bg-red-900/20"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{stock.nameAr}</p>
                  <p className="text-xs text-gray-500">{stock.symbol}</p>
                </div>
                <GainLossBadge value={stock.gainLossPercent} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">المحافظ</h2>
          <div className="space-y-3">
            {data.portfolioBreakdown.map((p) => (
              <Link
                key={p.id}
                href={`/portfolios/${p.id}`}
                className="flex items-center justify-between rounded-xl border border-gray-100 p-3 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{p.name}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(p.value)}</p>
                  </div>
                </div>
                <GainLossBadge value={p.gainLossPercent} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">آخر المعاملات</h2>
            <Link href="/transactions" className="text-sm text-emerald-600 hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="space-y-2">
            {data.recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {transactionTypeLabels[tx.type] || tx.type} - {tx.stock.nameAr}
                  </p>
                  <p className="text-xs text-gray-500">
                    {tx.portfolio.name} • {formatShortDate(tx.date)}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-semibold">{formatCurrency(tx.quantity * tx.price)}</p>
                  <p className="text-xs text-gray-400">{tx.quantity} سهم</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">الأسهم الأكثر تداولاً</h2>
            <Link href="/stocks" className="text-sm text-emerald-600 hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="space-y-2">
            {data.marketOverview.map((stock) => {
              const change =
                ((stock.currentPrice - stock.previousClose) / stock.previousClose) * 100;
              return (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{stock.nameAr}</p>
                    <p className="text-xs text-gray-500">{stock.symbol}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{formatCurrency(stock.currentPrice)}</p>
                    <GainLossBadge value={change} className="mt-0.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
