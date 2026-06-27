import type { Holding } from '../types';

const STORAGE_KEY = 'saudi-investment-tracker-holdings';

export function loadHoldings(): Holding[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Holding[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHoldings(holdings: Holding[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
}

export function generateId(): string {
  return crypto.randomUUID();
}
