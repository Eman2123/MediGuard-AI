"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

type HistoryEntry = {
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

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => setEntries(data.history || []))
      .catch(() => setError("Couldn't load history."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-deep text-fg">
      {/* DARK HEADER - Home Link Added */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-darkPanel">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/" className="text-sm font-medium text-slate-300 transition hover:text-white">Home</Link>
            <span className="h-4 w-px bg-slate-700"></span>
            
            <Link href="/dashboard" className="text-sm font-medium text-slate-300 transition hover:text-white">Assess</Link>
            <Link href="/history" className="text-sm font-medium text-white transition hover:text-white">History</Link>
            <Link href="/environment" className="text-sm font-medium text-slate-300 transition hover:text-white">Environment</Link>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="rounded-md bg-signal px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-signal-light"
            >
              New Assessment
            </Link>
          </div>
        </nav>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Page Header */}
        <div className="mb-10 max-w-2xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-md border border-teal-100 bg-teal-50 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-signal">
            Recent activity
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Shipment history
          </h1>
          <p className="mt-3 text-muted">
            Review your past assessments, track cooling costs, and verify flagged segments for previous shipments.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-white p-8 shadow-sm text-muted">
            <svg className="h-5 w-5 animate-spin text-signal" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading history…
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-risk-critical shadow-sm">
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-semibold">Failed to Load</p>
              <p className="mt-1 text-red-700/80">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && entries.length === 0 && (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white p-12 text-center shadow-sm">
            <svg className="mb-4 h-12 w-12 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium text-fg">No assessments yet</p>
            <p className="mt-2 text-sm text-muted">
              Run your first shipment assessment to see it appear here.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-signal px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-signal-light"
            >
              Go to Dashboard
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}

        {/* History Table */}
        {!loading && !error && entries.length > 0 && (
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
            {/* Table Header for Desktop */}
            <div className="hidden grid-cols-12 gap-4 border-b border-border pb-3 text-xs font-semibold uppercase tracking-wider text-muted md:grid">
              <span className="col-span-3">Shipment ID</span>
              <span className="col-span-2">Cargo</span>
              <span className="col-span-3">Route</span>
              <span className="col-span-2 text-center">Status</span>
              <span className="col-span-2 text-right">Cooling Cost</span>
            </div>

            <div className="mt-4 space-y-3">
              {entries.map((e) => {
                const isWarning = e.total_unknown_segments > 0;
                const isCritical = !isWarning && e.total_flagged_segments > 0;
                const isSafe = !isWarning && !isCritical;

                return (
                  <div
                    key={e.shipment_id}
                    className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-4 items-center rounded-xl border border-border bg-slate-50/50 px-5 py-4 text-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-100/60"
                  >
                    {/* Shipment ID */}
                    <div className="col-span-2 md:col-span-3 flex flex-col">
                      <span className="text-[0.65rem] uppercase tracking-wider text-muted md:hidden">Shipment ID</span>
                      <span className="font-mono font-medium text-fg truncate">{e.shipment_id}</span>
                    </div>

                    {/* Cargo */}
                    <div className="flex flex-col md:col-span-2">
                      <span className="text-[0.65rem] uppercase tracking-wider text-muted md:hidden">Cargo</span>
                      <span className="capitalize text-fg">{e.cargo_type}</span>
                    </div>

                    {/* Route */}
                    <div className="flex flex-col md:col-span-3">
                      <span className="text-[0.65rem] uppercase tracking-wider text-muted md:hidden">Route</span>
                      <span className="text-muted">
                        {e.origin_city} → {e.destination_city}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col md:col-span-2 md:items-center">
                      <span className="text-[0.65rem] uppercase tracking-wider text-muted md:hidden mb-1">Status</span>
                      <span className={`inline-flex items-center justify-center rounded-md px-2.5 py-1 text-xs font-semibold ${
                        isCritical ? 'bg-red-100 text-risk-critical' : 
                        isWarning ? 'bg-amber-100 text-risk-warning' : 
                        'bg-emerald-100 text-risk-safe'
                      }`}>
                        {isCritical ? `${e.total_flagged_segments} flagged` : 
                         isWarning ? `${e.total_unknown_segments} unverified` : 
                         'Safe'}
                      </span>
                    </div>

                    {/* Cooling Cost */}
                    <div className="flex flex-col md:col-span-2 md:items-end">
                      <span className="text-[0.65rem] uppercase tracking-wider text-muted md:hidden">Cost</span>
                      <span className="font-mono text-base font-bold text-fg">
                        ${e.total_cooling_cost}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* DARK FOOTER */}
      <Footer />
    </main>
  );
}

// DARK FOOTER Component
function Footer() {
  const year = 2024; // Static year to prevent hydration mismatch
  
  return (
    <footer className="relative border-t border-slate-800 bg-darkPanel text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-slate-400">
              Hyperlocal cooling intelligence for insulin, vaccines, blood, and organs in transit.
            </p>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">Product</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/dashboard" className="text-slate-300 transition hover:text-signal-light">Assess a shipment</Link></li>
              <li><Link href="/history" className="text-slate-300 transition hover:text-signal-light">Shipment history</Link></li>
              <li><Link href="/environment" className="text-slate-300 transition hover:text-signal-light">Environment data</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">Company</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li><a href="#" className="text-slate-300 transition hover:text-signal-light">About</a></li>
              <li><a href="#" className="text-slate-300 transition hover:text-signal-light">Blog</a></li>
              <li><a href="#" className="text-slate-300 transition hover:text-signal-light">Careers</a></li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">Resources</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li><a href="#" className="text-slate-300 transition hover:text-signal-light">Documentation</a></li>
              <li><a href="#" className="text-slate-300 transition hover:text-signal-light">API Status</a></li>
              <li><a href="#" className="text-slate-300 transition hover:text-signal-light">Guides</a></li>
            </ul>
          </div>
        </div>

        {/* Giant Watermark Text */}
        <div className="mt-20 border-t border-slate-800 pt-8 overflow-hidden">
          <h2 className="font-display text-[12vw] md:text-[9rem] font-bold leading-none tracking-tighter text-slate-800 whitespace-nowrap">
            MEDIGUARD AI
          </h2>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-xs text-slate-500 sm:flex-row">
          <p>© {year} MediGuard AI. All readings are estimates — verify before shipping.</p>
          <p className="font-mono uppercase tracking-[0.2em]">Built for FortyGuard Hackathon</p>
        </div>
      </div>
    </footer>
  );
}