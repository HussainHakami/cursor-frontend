import { useState } from 'react';
import { useHoldings } from './hooks/useHoldings';
import { computePortfolioSummary, computeAllocation } from './types';
import { PortfolioStats } from './components/PortfolioStats';
import { AllocationChart } from './components/AllocationChart';
import { HoldingsTable, TopHoldings } from './components/HoldingsTable';
import { HoldingForm, Modal } from './components/HoldingForm';
import type { Holding } from './types';

function App() {
  const {
    holdings,
    addHolding,
    updateHolding,
    deleteHolding,
    refreshPrices,
    refreshing,
    lastRefresh,
  } = useHoldings();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);

  const summary = computePortfolioSummary(holdings);
  const allocation = computeAllocation(holdings);

  const handleAdd = (data: Omit<Holding, 'id'>) => {
    addHolding(data);
    setShowAddModal(false);
  };

  const handleEdit = (data: Omit<Holding, 'id'>) => {
    if (editingHolding) {
      updateHolding(editingHolding.id, data);
      setEditingHolding(null);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface-raised/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold">Investment Tracker</h1>
              <p className="text-xs text-text-secondary">Portfolio overview</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshPrices}
              disabled={refreshing || holdings.length === 0}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-overlay hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {refreshing ? 'Updating...' : 'Refresh Prices'}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Holding
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {lastRefresh && (
          <p className="mb-4 text-xs text-text-secondary">
            Prices last updated {lastRefresh.toLocaleString()}
          </p>
        )}

        <section className="mb-6">
          <PortfolioStats {...summary} />
        </section>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface-raised p-5 lg:col-span-2">
            <h2 className="mb-4 text-base font-semibold">Asset Allocation</h2>
            <AllocationChart data={allocation} />
          </div>
          <div className="rounded-xl border border-border bg-surface-raised p-5">
            <h2 className="mb-4 text-base font-semibold">Top Holdings</h2>
            <TopHoldings holdings={holdings} />
            {holdings.length === 0 && (
              <p className="text-sm text-text-secondary">No holdings to display</p>
            )}
          </div>
        </div>

        <section className="rounded-xl border border-border bg-surface-raised p-5">
          <h2 className="mb-4 text-base font-semibold">All Holdings</h2>
          <HoldingsTable
            holdings={holdings}
            onEdit={setEditingHolding}
            onDelete={deleteHolding}
          />
        </section>
      </main>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Holding">
        <HoldingForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} />
      </Modal>

      <Modal
        open={editingHolding !== null}
        onClose={() => setEditingHolding(null)}
        title="Edit Holding"
      >
        {editingHolding && (
          <HoldingForm
            initial={editingHolding}
            onSubmit={handleEdit}
            onCancel={() => setEditingHolding(null)}
          />
        )}
      </Modal>
    </div>
  );
}

export default App;
