"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Logo from "@/components/Logo";
import { smartAssessShipment, getErrorMessage } from "@/lib/api";
import { saveHistoryEntry } from "@/lib/history";
import type { RouteSegment } from "@/components/RouteMap";

// Leaflet touches `window`/`document` at import time, so it can only render
// on the client — dynamic + ssr:false keeps Next.js from trying (and
// failing) to server-render it.
const RouteMap = dynamic(() => import("@/components/RouteMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 items-center justify-center rounded-2xl border border-border bg-panel2 text-sm text-muted">
      Loading map…
    </div>
  ),
});

type Comparison = {
  departure_time: string;
  total_cooling_cost: number;
  total_flagged_segments: number;
  total_unknown_segments: number;
  total_distance_miles: number;
  avg_max_temp: number | null;
};

type SmartAssessResult = {
  parsed_request: {
    cargo_type: string;
    origin_city: string;
    destination_city: string;
    departure_time: string;
  };
  comparisons: Comparison[];
  route_segments: RouteSegment[];
  skipped_times: { departure_time: string; reason: string }[];
  recommended_departure_time: string;
  estimated_savings_vs_worst: number;
  data_incomplete: boolean;
  summary: string;
};

export default function DashboardPage() {
  const [userInput, setUserInput] = useState(
    "Ship insulin from Denver to Colorado Springs"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SmartAssessResult | null>(null);

  // UPDATED: Use the utility function instead of direct fetch
  async function handleSmartAssess() {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const data = (await smartAssessShipment(userInput)) as SmartAssessResult;
      setResult(data);

      const best = data.comparisons.find(
        (c) => c.departure_time === data.recommended_departure_time
      );
      saveHistoryEntry({
        shipment_id: `mg-${Date.now().toString(36)}`,
        cargo_type: data.parsed_request.cargo_type,
        origin_city: data.parsed_request.origin_city,
        destination_city: data.parsed_request.destination_city,
        departure_time: data.recommended_departure_time,
        total_flagged_segments: best?.total_flagged_segments ?? 0,
        total_unknown_segments: best?.total_unknown_segments ?? 0,
        total_cooling_cost: best?.total_cooling_cost ?? 0,
        savings: data.estimated_savings_vs_worst,
      });
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-deep text-fg">
      {/* DARK HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-darkPanel">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/" className="text-sm font-medium text-slate-300 transition hover:text-white">
              Home
            </Link>
            <span className="h-4 w-px bg-slate-700"></span>
            
            <Link href="/dashboard" className="text-sm font-medium text-white transition hover:text-white">
              Assess
            </Link>
            <Link href="/history" className="text-sm font-medium text-slate-300 transition hover:text-white">
              History
            </Link>
            <Link href="/environment" className="text-sm font-medium text-slate-300 transition hover:text-white">
              Environment
            </Link>
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
            Assess a shipment
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Describe the shipment. We&apos;ll find the safest window.
          </h1>
          <p className="mt-3 text-muted">
            Enter your cargo, route, and departure details in plain English. Our AI will read live street-level temperatures and tell you exactly when it&apos;s safe to go.
          </p>
        </div>

        {/* Input Card */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
          <label htmlFor="user_input" className="mb-3 block text-sm font-medium text-fg">
            Shipment description
          </label>
          <div className="relative">
            <textarea
              id="user_input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-border bg-slate-50 px-4 py-4 text-base text-fg outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-signal focus:bg-white focus:ring-4 focus:ring-teal-100/50"
              placeholder="e.g., Ship insulin from Phoenix to Denver tomorrow at 6am"
            />
          </div>
          
          <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">
              No account needed. Data is processed live.
            </p>
            <button
              onClick={handleSmartAssess}
              disabled={loading || !userInput.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-signal px-6 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:bg-signal-light disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-signal"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Reading route temperature…
                </>
              ) : (
                <>
                  Run assessment
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-risk-critical shadow-sm">
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-semibold">Assessment Failed</p>
              <p className="mt-1 text-red-700/80">{error}</p>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="mt-10 space-y-8">
            {/* Recommendation Card */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm md:p-8">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-100 blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2">
                  <svg className="h-6 w-6 text-risk-safe" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-risk-safe">
                    Recommendation
                  </p>
                </div>
                <p className="mt-4 text-lg font-medium leading-relaxed text-fg">
                  {result.summary}
                </p>
                
                {result.data_incomplete && (
                  <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-white/50 p-4 text-sm text-risk-warning">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-amber-700">Incomplete Data Warning</p>
                      <span className="mt-1 block text-amber-600/90">
                        Based on incomplete temperature data — some segments couldn&apos;t be verified. Re-run before relying on this for an actual shipment.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Route Map */}
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">
                Route temperature map
              </p>
              <RouteMap segments={result.route_segments ?? []} />
            </div>

            {/* Additional Results would go here */}
            {/* e.g., ComparisonTable, etc. */}
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
