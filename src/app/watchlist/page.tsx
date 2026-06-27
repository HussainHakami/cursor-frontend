"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Target, Eye } from "lucide-react";
import {
  Modal,
  FormField,
  inputClass,
  selectClass,
  buttonPrimaryClass,
  buttonSecondaryClass,
} from "@/components/Modal";
import { LoadingSpinner, GainLossBadge, EmptyState } from "@/components/ui";
import { formatCurrency, formatShortDate } from "@/lib/utils";

interface WatchlistItem {
  id: string;
  targetPrice: number | null;
  notes: string | null;
  createdAt: string;
  change: number;
  changePercent: number;
  distanceToTarget: number | null;
  stock: {
    id: string;
    symbol: string;
    nameAr: string;
    sector: string;
    currentPrice: number;
    previousClose: number;
    pe: number | null;
    dividendYield: number | null;
  };
}

interface Stock {
  id: string;
  symbol: string;
  nameAr: string;
  currentPrice: number;
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ stockId: "", targetPrice: "", notes: "" });

  const fetchWatchlist = () => {
    fetch("/api/watchlist")
      .then((r) => r.json())
      .then(setItems)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWatchlist();
    fetch("/api/stocks").then((r) => r.json()).then(setStocks);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stockId: form.stockId,
        targetPrice: form.targetPrice ? parseFloat(form.targetPrice) : null,
        notes: form.notes || null,
      }),
    });
    setShowModal(false);
    setForm({ stockId: "", targetPrice: "", notes: "" });
    fetchWatchlist();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/watchlist?id=${id}`, { method: "DELETE" });
    fetchWatchlist();
  };

  const nearTarget = items.filter(
    (i) => i.targetPrice && i.distanceToTarget !== null && Math.abs(i.distanceToTarget) < 5
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">قائمة المراقبة</h1>
          <p className="mt-1 text-sm text-gray-500">تابع الأسهم التي تهمك</p>
        </div>
        <button onClick={() => setShowModal(true)} className={buttonPrimaryClass}>
          <Plus className="ml-2 inline h-4 w-4" />
          إضافة سهم
        </button>
      </div>

      {nearTarget.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Target className="h-5 w-5" />
            <span className="font-semibold">
              {nearTarget.length} سهم قريب من السعر المستهدف
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState
          title="قائمة المراقبة فارغة"
          description="أضف أسهمًا لمتابعة أسعارها"
          action={
            <button onClick={() => setShowModal(true)} className={buttonPrimaryClass}>
              إضافة سهم
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-100 p-2.5 dark:bg-emerald-900/30">
                    <Eye className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {item.stock.nameAr}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {item.stock.symbol} • {item.stock.sector}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(item.stock.currentPrice)}
                  </p>
                  <GainLossBadge value={item.changePercent} className="mt-1" />
                </div>
                {item.targetPrice && (
                  <div className="text-left">
                    <p className="text-xs text-gray-500">السعر المستهدف</p>
                    <p className="font-semibold text-emerald-600">
                      {formatCurrency(item.targetPrice)}
                    </p>
                    {item.distanceToTarget !== null && (
                      <p className={`text-xs ${item.distanceToTarget <= 0 ? "text-emerald-600" : "text-gray-400"}`}>
                        {item.distanceToTarget <= 0 ? "وصل للهدف!" : `${item.distanceToTarget.toFixed(1)}% للهدف`}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {item.notes && (
                <p className="mt-3 rounded-lg bg-gray-50 p-2 text-sm text-gray-600 dark:bg-gray-800">
                  {item.notes}
                </p>
              )}

              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-400 dark:border-gray-800">
                <span>أُضيف {formatShortDate(item.createdAt)}</span>
                {item.stock.dividendYield && (
                  <span>توزيعات: {item.stock.dividendYield}%</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="إضافة لقائمة المراقبة">
        <form onSubmit={handleAdd}>
          <FormField label="السهم" required>
            <select
              className={selectClass}
              value={form.stockId}
              onChange={(e) => {
                const stock = stocks.find((s) => s.id === e.target.value);
                setForm({
                  ...form,
                  stockId: e.target.value,
                  targetPrice: stock ? String(stock.currentPrice) : "",
                });
              }}
              required
            >
              <option value="">اختر السهم</option>
              {stocks.map((s) => (
                <option key={s.id} value={s.id}>{s.nameAr} ({s.symbol})</option>
              ))}
            </select>
          </FormField>
          <FormField label="السعر المستهدف (ر.س)">
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={form.targetPrice}
              onChange={(e) => setForm({ ...form, targetPrice: e.target.value })}
              placeholder="السعر الذي تريد الشراء عنده"
            />
          </FormField>
          <FormField label="ملاحظات">
            <textarea
              className={inputClass}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="ملاحظاتك عن هذا السهم"
              rows={3}
            />
          </FormField>
          <div className="flex gap-3">
            <button type="submit" className={buttonPrimaryClass}>إضافة</button>
            <button type="button" onClick={() => setShowModal(false)} className={buttonSecondaryClass}>
              إلغاء
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
