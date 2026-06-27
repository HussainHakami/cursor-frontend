"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { SectorPieChart } from "@/components/Charts";
import {
  Modal,
  FormField,
  inputClass,
  selectClass,
  buttonPrimaryClass,
  buttonSecondaryClass,
} from "@/components/Modal";
import { LoadingSpinner, GainLossBadge, EmptyState } from "@/components/ui";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { SECTOR_COLORS, CHART_COLORS } from "@/lib/calculations";

interface HoldingMetric {
  id: string;
  symbol: string;
  nameAr: string;
  sector: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
  weight: number;
}

interface PortfolioDetail {
  id: string;
  name: string;
  description: string | null;
  color: string;
  totalMarketValue: number;
  totalCostBasis: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  metrics: HoldingMetric[];
  sectorAllocation: Record<string, number>;
}

interface Stock {
  id: string;
  symbol: string;
  nameAr: string;
  currentPrice: number;
}

export default function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [portfolio, setPortfolio] = useState<PortfolioDetail | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddHolding, setShowAddHolding] = useState(false);
  const [holdingForm, setHoldingForm] = useState({
    stockId: "",
    quantity: "",
    avgBuyPrice: "",
  });

  const fetchPortfolio = () => {
    fetch(`/api/portfolios/${id}`)
      .then((r) => r.json())
      .then(setPortfolio)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPortfolio();
    fetch("/api/stocks")
      .then((r) => r.json())
      .then(setStocks);
  }, [id]);

  const handleAddHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/holdings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        portfolioId: id,
        stockId: holdingForm.stockId,
        quantity: parseFloat(holdingForm.quantity),
        avgBuyPrice: parseFloat(holdingForm.avgBuyPrice),
      }),
    });
    setShowAddHolding(false);
    setHoldingForm({ stockId: "", quantity: "", avgBuyPrice: "" });
    fetchPortfolio();
  };

  const handleDeleteHolding = async (holdingId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الحيازة؟")) return;
    await fetch(`/api/holdings?id=${holdingId}`, { method: "DELETE" });
    fetchPortfolio();
  };

  if (loading) return <LoadingSpinner />;
  if (!portfolio) return <EmptyState title="المحفظة غير موجودة" />;

  const sectorData = Object.entries(portfolio.sectorAllocation).map(
    ([name, value], i) => ({
      name,
      value,
      color: SECTOR_COLORS[name] || CHART_COLORS[i % CHART_COLORS.length],
      percent:
        portfolio.totalMarketValue > 0
          ? (value / portfolio.totalMarketValue) * 100
          : 0,
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portfolios" className="text-gray-400 hover:text-gray-600">
          <ArrowRight className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: portfolio.color }}
            />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {portfolio.name}
            </h1>
          </div>
          {portfolio.description && (
            <p className="mt-1 text-sm text-gray-500">{portfolio.description}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="القيمة السوقية"
          value={formatCurrency(portfolio.totalMarketValue)}
          iconColor="bg-emerald-600"
          icon={ArrowRight}
        />
        <StatsCard
          title="تكلفة الشراء"
          value={formatCurrency(portfolio.totalCostBasis)}
          iconColor="bg-blue-600"
          icon={ArrowRight}
        />
        <StatsCard
          title="الربح / الخسارة"
          value={formatCurrency(portfolio.totalGainLoss)}
          change={portfolio.totalGainLossPercent}
          iconColor={portfolio.totalGainLoss >= 0 ? "bg-emerald-600" : "bg-red-500"}
          icon={ArrowRight}
        />
        <StatsCard
          title="تغير اليوم"
          value={formatCurrency(portfolio.dayChange)}
          change={portfolio.dayChangePercent}
          iconColor="bg-amber-600"
          icon={ArrowRight}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">الحيازات</h2>
              <button onClick={() => setShowAddHolding(true)} className={buttonPrimaryClass}>
                <Plus className="ml-1 inline h-4 w-4" />
                إضافة سهم
              </button>
            </div>

            {portfolio.metrics.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="لا توجد حيازات"
                  description="أضف أسهمك لبدء تتبع أداء المحفظة"
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                      <th className="p-4 text-right font-medium text-gray-500">السهم</th>
                      <th className="p-4 text-right font-medium text-gray-500">الكمية</th>
                      <th className="p-4 text-right font-medium text-gray-500">متوسط الشراء</th>
                      <th className="p-4 text-right font-medium text-gray-500">السعر الحالي</th>
                      <th className="p-4 text-right font-medium text-gray-500">القيمة</th>
                      <th className="p-4 text-right font-medium text-gray-500">الربح/الخسارة</th>
                      <th className="p-4 text-right font-medium text-gray-500">الوزن</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.metrics.map((h) => (
                      <tr
                        key={h.id}
                        className="border-b border-gray-50 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                      >
                        <td className="p-4">
                          <p className="font-semibold text-gray-900 dark:text-white">{h.nameAr}</p>
                          <p className="text-xs text-gray-500">{h.symbol} • {h.sector}</p>
                        </td>
                        <td className="p-4">{formatNumber(h.quantity, 0)}</td>
                        <td className="p-4">{formatCurrency(h.avgBuyPrice)}</td>
                        <td className="p-4">{formatCurrency(h.currentPrice)}</td>
                        <td className="p-4 font-semibold">{formatCurrency(h.marketValue)}</td>
                        <td className="p-4">
                          <div>
                            <p className={h.gainLoss >= 0 ? "text-emerald-600" : "text-red-500"}>
                              {formatCurrency(h.gainLoss)}
                            </p>
                            <GainLossBadge value={h.gainLossPercent} />
                          </div>
                        </td>
                        <td className="p-4">{formatNumber(h.weight)}%</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleDeleteHolding(h.id)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">توزيع القطاعات</h2>
          <SectorPieChart data={sectorData} />
        </div>
      </div>

      <Modal isOpen={showAddHolding} onClose={() => setShowAddHolding(false)} title="إضافة سهم للمحفظة">
        <form onSubmit={handleAddHolding}>
          <FormField label="السهم" required>
            <select
              className={selectClass}
              value={holdingForm.stockId}
              onChange={(e) => {
                const stock = stocks.find((s) => s.id === e.target.value);
                setHoldingForm({
                  ...holdingForm,
                  stockId: e.target.value,
                  avgBuyPrice: stock ? String(stock.currentPrice) : "",
                });
              }}
              required
            >
              <option value="">اختر السهم</option>
              {stocks.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameAr} ({s.symbol})
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="الكمية" required>
            <input
              type="number"
              className={inputClass}
              value={holdingForm.quantity}
              onChange={(e) => setHoldingForm({ ...holdingForm, quantity: e.target.value })}
              placeholder="عدد الأسهم"
              min="1"
              required
            />
          </FormField>
          <FormField label="متوسط سعر الشراء (ر.س)" required>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={holdingForm.avgBuyPrice}
              onChange={(e) => setHoldingForm({ ...holdingForm, avgBuyPrice: e.target.value })}
              placeholder="سعر الشراء"
              required
            />
          </FormField>
          <div className="flex gap-3">
            <button type="submit" className={buttonPrimaryClass}>إضافة</button>
            <button type="button" onClick={() => setShowAddHolding(false)} className={buttonSecondaryClass}>
              إلغاء
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
