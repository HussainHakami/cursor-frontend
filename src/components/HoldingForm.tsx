import { useState } from 'react';
import type { AssetType, Holding } from '../types';
import { ASSET_TYPES } from '../types';
import { cn } from '../lib/format';

interface HoldingFormProps {
  onSubmit: (holding: Omit<Holding, 'id'>) => void;
  onCancel: () => void;
  initial?: Holding;
}

const emptyForm = {
  symbol: '',
  name: '',
  type: 'stock' as AssetType,
  quantity: '',
  purchasePrice: '',
  purchaseDate: new Date().toISOString().split('T')[0],
};

export function HoldingForm({ onSubmit, onCancel, initial }: HoldingFormProps) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          symbol: initial.symbol,
          name: initial.name,
          type: initial.type,
          quantity: String(initial.quantity),
          purchasePrice: String(initial.purchasePrice),
          purchaseDate: initial.purchaseDate,
        }
      : emptyForm,
  );
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const quantity = parseFloat(form.quantity);
    const purchasePrice = parseFloat(form.purchasePrice);

    if (!form.symbol.trim()) {
      setError('Symbol is required');
      return;
    }
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    if (isNaN(quantity) || quantity <= 0) {
      setError('Quantity must be a positive number');
      return;
    }
    if (isNaN(purchasePrice) || purchasePrice <= 0) {
      setError('Purchase price must be a positive number');
      return;
    }

    onSubmit({
      symbol: form.symbol.trim().toUpperCase(),
      name: form.name.trim(),
      type: form.type,
      quantity,
      purchasePrice,
      purchaseDate: form.purchaseDate,
      currentPrice: initial?.currentPrice,
      lastUpdated: initial?.lastUpdated,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">
            Symbol
          </label>
          <input
            type="text"
            value={form.symbol}
            onChange={(e) => setForm({ ...form, symbol: e.target.value })}
            placeholder="AAPL"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">
            Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Apple Inc."
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">
            Asset Type
          </label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as AssetType })}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          >
            {ASSET_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">
            Purchase Date
          </label>
          <input
            type="date"
            value={form.purchaseDate}
            onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">
            Quantity
          </label>
          <input
            type="number"
            step="any"
            min="0"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            placeholder="10"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">
            Purchase Price (per unit)
          </label>
          <input
            type="number"
            step="any"
            min="0"
            value={form.purchasePrice}
            onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
            placeholder="150.00"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-overlay"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          {initial ? 'Save Changes' : 'Add Holding'}
        </button>
      </div>
    </form>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-surface-raised p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-text-secondary transition hover:bg-surface-overlay hover:text-text-primary"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function TypeBadge({ type }: { type: AssetType }) {
  const colors: Record<AssetType, string> = {
    stock: 'bg-blue-500/20 text-blue-400',
    etf: 'bg-purple-500/20 text-purple-400',
    crypto: 'bg-orange-500/20 text-orange-400',
    bond: 'bg-emerald-500/20 text-emerald-400',
    other: 'bg-slate-500/20 text-slate-400',
  };

  return (
    <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium capitalize', colors[type])}>
      {type}
    </span>
  );
}
