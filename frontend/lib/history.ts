export type HistoryEntry = {
  shipment_id: string;
  cargo_type: string;
  origin_city: string;
  destination_city: string;
  departure_time: string;
  total_flagged_segments: number;
  total_unknown_segments: number;
  total_cooling_cost: number;
  savings: number;
};

const STORAGE_KEY = "mediguard_history";
const MAX_ENTRIES = 50;

/**
 * Client-side history store using localStorage.
 *
 * NOTE: the backend's in-memory history (backend/app/services/history_store.py)
 * does NOT persist reliably on Vercel — each serverless invocation can run in
 * a different container, so a POST /api/smart-assess and a following GET
 * /api/history can hit completely separate instances with separate memory.
 * Storing history client-side sidesteps that entirely.
 */
export function saveHistoryEntry(entry: HistoryEntry): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getHistoryEntries();
    const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save history entry:", e);
  }
}

export function getHistoryEntries(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch (e) {
    console.error("Failed to read history:", e);
    return [];
  }
}
