"use client";

import { useEffect, useState } from "react";
import { Plus, ArrowDownLeft, ArrowUpRight, DollarSign } from "lucide-react";
import {
  Modal,
  FormField,
  inputClass,
  selectClass,
  buttonPrimaryClass,
  buttonSecondaryClass,
} from "@/components/Modal";
import { LoadingSpinner, EmptyState } from "@/components/ui";
import { formatCurrency, formatShortDate } from "@/lib/utils";

interface Transaction {
  id: string;
  type: string;
  quantity: number;
  price: number;
  fees: number;
  date: string;
  notes: string | null;
  stock: { id: string; symbol: string; nameAr: string };
  portfolio: { id: string; name: string };
}

interface Portfolio {
  id: string;
  name: string;
}

interface Stock {
  id: string;
  symbol: string;
  nameAr: string;
  currentPrice: number;
}

const typeLabels: Record<string, string> = {
  BUY: "شراء",
  SELL: "بيع",
  DIVIDEND: "توزيعات أرباح",
};

const typeIcons: Record<string, typeof ArrowDownLeft> = {
  BUY: ArrowDownLeft,
  SELL: ArrowUpRight,
  DIVIDEND: DollarSign,
};

const typeColors: Record<string, string> = {
  BUY: "bg-emerald-100 text-emerald-700",
  SELL: "bg-red-100 text-red-700",
  DIVIDEND: "bg-amber-100 text-amber-700",
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState({ portfolioId: "", type: "" });
  const [form, setForm] = useState({
    portfolioId: "",
    stockId: "",
    type: "BUY",
    quantity: "",
    price: "",
    fees: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const fetchTransactions = () => {
    const params = new URLSearchParams();
    if (filter.portfolioId) params.set("portfolioId", filter.portfolioId);

    fetch(`/api/transactions?${params}`)
      .then((r) => r.json())
      .then((data) => {
        const filtered = filter.type
          ? data.filter((t: Transaction) => t.type === filter.type)
          : data;
        setTransactions(filtered);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransactions();
    fetch("/api/portfolios").then((r) => r.json()).then(setPortfolios);
    fetch("/api/stocks").then((r) => r.json()).then(setStocks);
  }, [filter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        quantity: parseFloat(form.quantity),
        price: parseFloat(form.price),
        fees: parseFloat(form.fees) || 0,
      }),
    });
    setShowModal(false);
    setForm({
      portfolioId: "",
      stockId: "",
      type: "BUY",
      quantity: "",
      price: "",
      fees: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    fetchTransactions();
  };

  const totalBuy = transactions
    .filter((t) => t.type === "BUY")
    .reduce((s, t) => s + t.quantity * t.price, 0);
  const totalSell = transactions
    .filter((t) => t.type === "SELL")
    .reduce((s, t) => s + t.quantity * t.price, 0);
  const totalDividends = transactions
    .filter((t) => t.type === "DIVIDEND")
    .reduce((s, t) => s + t.quantity * t.price, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المعاملات</h1>
          <p className="mt-1 text-sm text-gray-500">سجل عمليات الشراء والبيع والتوزيعات</p>
        </div>
        <button onClick={() => setShowModal(true)} className={buttonPrimaryClass}>
          <Plus className="ml-2 inline h-4 w-4" />
          معاملة جديدة
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500">إجمالي المشتريات</p>
          <p className="mt-1 text-xl font-bold text-emerald-600">{formatCurrency(totalBuy)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500">إجمالي المبيعات</p>
          <p className="mt-1 text-xl font-bold text-red-500">{formatCurrency(totalSell)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500">إجمالي التوزيعات</p>
          <p className="mt-1 text-xl font-bold text-amber-600">{formatCurrency(totalDividends)}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <select
          className={`${selectClass} sm:w-48`}
          value={filter.portfolioId}
          onChange={(e) => setFilter({ ...filter, portfolioId: e.target.value })}
        >
          <option value="">جميع المحافظ</option>
          {portfolios.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          className={`${selectClass} sm:w-48`}
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
        >
          <option value="">جميع الأنواع</option>
          <option value="BUY">شراء</option>
          <option value="SELL">بيع</option>
          <option value="DIVIDEND">توزيعات</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : transactions.length === 0 ? (
        <EmptyState title="لا توجد معاملات" description="سجّل أول معاملة لك" />
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const Icon = typeIcons[tx.type] || ArrowDownLeft;
            const total = tx.quantity * tx.price;
            return (
              <div
                key={tx.id}
                className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <div className={`rounded-xl p-3 ${typeColors[tx.type]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {typeLabels[tx.type]}
                    </span>
                    <span className="text-gray-600">- {tx.stock.nameAr}</span>
                    <span className="text-xs text-gray-400">({tx.stock.symbol})</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {tx.portfolio.name} • {formatShortDate(tx.date)}
                    {tx.notes && ` • ${tx.notes}`}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(total)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {tx.quantity} × {formatCurrency(tx.price)}
                    {tx.fees > 0 && ` + ${formatCurrency(tx.fees)} رسوم`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="تسجيل معاملة جديدة" size="lg">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="المحفظة" required>
              <select
                className={selectClass}
                value={form.portfolioId}
                onChange={(e) => setForm({ ...form, portfolioId: e.target.value })}
                required
              >
                <option value="">اختر المحفظة</option>
                {portfolios.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="نوع المعاملة" required>
              <select
                className={selectClass}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="BUY">شراء</option>
                <option value="SELL">بيع</option>
                <option value="DIVIDEND">توزيعات أرباح</option>
              </select>
            </FormField>
            <FormField label="السهم" required>
              <select
                className={selectClass}
                value={form.stockId}
                onChange={(e) => {
                  const stock = stocks.find((s) => s.id === e.target.value);
                  setForm({
                    ...form,
                    stockId: e.target.value,
                    price: stock ? String(stock.currentPrice) : form.price,
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
            <FormField label="التاريخ" required>
              <input
                type="date"
                className={inputClass}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </FormField>
            <FormField label="الكمية" required>
              <input
                type="number"
                className={inputClass}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                min="1"
                required
              />
            </FormField>
            <FormField label="السعر (ر.س)" required>
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </FormField>
            <FormField label="الرسوم (ر.س)">
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={form.fees}
                onChange={(e) => setForm({ ...form, fees: e.target.value })}
              />
            </FormField>
            <FormField label="ملاحظات">
              <input
                className={inputClass}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="ملاحظات اختيارية"
              />
            </FormField>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" className={buttonPrimaryClass}>تسجيل</button>
            <button type="button" onClick={() => setShowModal(false)} className={buttonSecondaryClass}>
              إلغاء
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
