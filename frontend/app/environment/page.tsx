"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

const CITIES = [
  "phoenix",
  "houston",
  "boston",
  "los_angeles",
  "chicago",
  "miami",
  "denver",
  "seattle",
  "new_york",
  "san_francisco",
];

export default function EnvironmentPage() {
  const [city, setCity] = useState("phoenix");
  const [temperature, setTemperature] = useState("40.5");
  const [dateTime, setDateTime] = useState("2026-08-26T14:00:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<Record<string, number[]> | null>(null);
  const [solar, setSolar] = useState<{ ghi: number; dni: number; dhi: number } | null>(
    null
  );

  async function handleFetch() {
    setLoading(true);
    setError(null);
    setParams(null);
    setSolar(null);
    try {
      const res = await fetch("/api/env-params", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          date_time: dateTime,
          temperature: parseFloat(temperature),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Could not fetch environment data.");
      const loc = data.result?.locations?.[0];
      setParams(loc?.parameters || null);
      setSolar(loc?.solar_irradiance?.clear_sky || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

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
            <Link href="/history" className="text-sm font-medium text-slate-300 transition hover:text-white">History</Link>
            <Link href="/environment" className="text-sm font-medium text-white transition hover:text-white">Environment</Link>
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

      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Page Header */}
        <div className="mb-10 max-w-2xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-md border border-teal-100 bg-teal-50 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-signal">
            Beyond temperature
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Heat index, air quality &amp; solar load
          </h1>
          <p className="mt-3 text-muted">
            Fetch comprehensive environmental parameters for any location. Understand how humidity, solar irradiance, and air quality impact your cargo beyond just ambient temperature.
          </p>
        </div>

        {/* Input Card */}
        <div className="grid gap-4 rounded-2xl border border-border bg-white p-6 shadow-sm md:grid-cols-3 md:p-8">
          <Field label="City">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-lg border border-border bg-slate-50 px-3 py-2.5 text-fg outline-none transition focus:border-signal focus:bg-white focus:ring-4 focus:ring-teal-100/50"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace("_", " ")}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date &amp; time">
            <input
              type="text"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full rounded-lg border border-border bg-slate-50 px-3 py-2.5 text-fg outline-none transition focus:border-signal focus:bg-white focus:ring-4 focus:ring-teal-100/50"
            />
          </Field>
          <Field label="Ambient temperature (°C)">
            <input
              type="text"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="w-full rounded-lg border border-border bg-slate-50 px-3 py-2.5 text-fg outline-none transition focus:border-signal focus:bg-white focus:ring-4 focus:ring-teal-100/50"
            />
          </Field>
          <div className="md:col-span-3">
            <button
              onClick={handleFetch}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-signal px-6 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:bg-signal-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Fetching…
                </>
              ) : (
                <>
                  Get environmental data
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
              <p className="font-semibold">Fetch Failed</p>
              <p className="mt-1 text-red-700/80">{error}</p>
            </div>
          </div>
        )}

        {/* Parameters Grid */}
        {params && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Metric label="Heat index" value={params.heat_index_celsius?.[0]} unit="°C" />
            <Metric
              label="Feels like"
              value={params.apparent_temperature_celsius?.[0]}
              unit="°C"
            />
            <Metric
              label="Humidity"
              value={params.relative_humidity_percent?.[0]}
              unit="%"
            />
            <Metric label="Air quality index" value={params["air_quality:idx"]?.[0]} unit="" />
            <Metric label="CO₂" value={params.co2_ppm?.[0]} unit="ppm" />
            <Metric
              label="Wet bulb temp"
              value={params.wet_bulb_temperature_celsius?.[0]}
              unit="°C"
            />
          </div>
        )}

        {/* Solar Irradiance Card */}
        {solar && (
          <div className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-2">
              <svg className="h-5 w-5 text-signal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                Solar irradiance (clear sky)
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="font-display text-3xl font-bold text-fg">{solar.ghi}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted">GHI (W/m²)</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="font-display text-3xl font-bold text-fg">{solar.dni}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted">DNI (W/m²)</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="font-display text-3xl font-bold text-fg">{solar.dhi}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted">DHI (W/m²)</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DARK FOOTER */}
      <Footer />
    </main>
  );
}

// Reusable Input Field Component
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-fg">{label}</span>
      {children}
    </label>
  );
}

// Reusable Metric Component
function Metric({ label, value, unit }: { label: string; value?: number; unit: string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <p className="font-mono text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-signal">
        {value !== undefined ? `${value}${unit}` : "—"}
      </p>
    </div>
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