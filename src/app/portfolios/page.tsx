"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Briefcase, Trash2 } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { Modal, FormField, inputClass, buttonPrimaryClass, buttonSecondaryClass } from "@/components/Modal";
import { LoadingSpinner, GainLossBadge, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  color: string;
  holdingsCount: number;
  totalMarketValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: "#006C35" });

  const fetchPortfolios = () => {
    fetch("/api/portfolios")
      .then((r) => r.json())
      .then(setPortfolios)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/portfolios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowModal(false);
    setForm({ name: "", description: "", color: "#006C35" });
    fetchPortfolios();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المحفظة؟")) return;
    await fetch(`/api/portfolios/${id}`, { method: "DELETE" });
    fetchPortfolios();
  };

  const totalValue = portfolios.reduce((s, p) => s + p.totalMarketValue, 0);
  const totalGainLoss = portfolios.reduce((s, p) => s + p.totalGainLoss, 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المحافظ الاستثمارية</h1>
          <p className="mt-1 text-sm text-gray-500">إدارة محافظك في السوق السعودي</p>
        </div>
        <button onClick={() => setShowModal(true)} className={buttonPrimaryClass}>
          <Plus className="ml-2 inline h-4 w-4" />
          محفظة جديدة
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard
          title="إجمالي المحافظ"
          value={String(portfolios.length)}
          icon={Briefcase}
          iconColor="bg-emerald-600"
        />
        <StatsCard
          title="القيمة الإجمالية"
          value={formatCurrency(totalValue)}
          icon={Briefcase}
          iconColor="bg-blue-600"
        />
        <StatsCard
          title="إجمالي الربح/الخسارة"
          value={formatCurrency(totalGainLoss)}
          change={totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0}
          icon={Briefcase}
          iconColor={totalGainLoss >= 0 ? "bg-emerald-600" : "bg-red-500"}
        />
      </div>

      {portfolios.length === 0 ? (
        <EmptyState
          title="لا توجد محافظ"
          description="أنشئ محفظتك الأولى لبدء تتبع استثماراتك"
          action={
            <button onClick={() => setShowModal(true)} className={buttonPrimaryClass}>
              إنشاء محفظة
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {portfolios.map((portfolio) => (
            <div
              key={portfolio.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: portfolio.color }}
                  />
                  <div>
                    <Link
                      href={`/portfolios/${portfolio.id}`}
                      className="text-lg font-bold text-gray-900 hover:text-emerald-600 dark:text-white"
                    >
                      {portfolio.name}
                    </Link>
                    {portfolio.description && (
                      <p className="text-sm text-gray-500">{portfolio.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(portfolio.id)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">القيمة السوقية</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(portfolio.totalMarketValue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">الربح/الخسارة</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(portfolio.totalGainLoss)}
                    </p>
                    <GainLossBadge value={portfolio.totalGainLossPercent} />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                <span className="text-sm text-gray-500">
                  {portfolio.holdingsCount} سهم
                </span>
                <Link
                  href={`/portfolios/${portfolio.id}`}
                  className="text-sm font-medium text-emerald-600 hover:underline"
                >
                  عرض التفاصيل ←
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="إنشاء محفظة جديدة">
        <form onSubmit={handleCreate}>
          <FormField label="اسم المحفظة" required>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثال: محفظة التقاعد"
              required
            />
          </FormField>
          <FormField label="الوصف">
            <textarea
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="وصف اختياري للمحفظة"
              rows={3}
            />
          </FormField>
          <FormField label="اللون">
            <input
              type="color"
              className="h-10 w-full cursor-pointer rounded-xl"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            />
          </FormField>
          <div className="flex gap-3">
            <button type="submit" className={buttonPrimaryClass}>إنشاء</button>
            <button type="button" onClick={() => setShowModal(false)} className={buttonSecondaryClass}>
              إلغاء
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
