import Image from "next/image";
import Link from "next/link";
import TiltReadout3D from "@/components/TiltReadout3D";
import Logo from "@/components/Logo";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-deep text-fg">
      {/* 1. DARK HEADER (Cleaned) */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-darkPanel">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="hidden items-center gap-10 md:flex">
            <a href="#how-it-works" className="text-sm font-medium text-slate-300 transition hover:text-white">How it works</a>
            <a href="#cargo" className="text-sm font-medium text-slate-300 transition hover:text-white">Cargo Types</a>
            <a href="#readout" className="text-sm font-medium text-slate-300 transition hover:text-white">Live Readout</a>
          </div>
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="rounded-md bg-signal px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-signal-light"
            >
              Launch App
            </Link>
          </div>
        </nav>
      </header>

      <div className="relative z-10">
        {/* 2. LIGHT HERO SECTION (Video Visible) */}
        <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-deep">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/images/hero-route.png"
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/video/hero.mp4" type="video/mp4" />
          </video>

          {/* Soft Light Overlay only on left side */}
          <div className="absolute inset-0 bg-gradient-to-r from-deep via-deep/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-deep via-transparent to-transparent" />
          
          <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-16 px-6 py-20 lg:grid-cols-2 lg:items-center">
            <div className="max-w-2xl">
              <div className="mb-8 inline-flex items-center gap-2 rounded-md border border-border bg-white/90 backdrop-blur-sm px-4 py-1.5 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
                </span>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                  Street-level cooling intelligence
                </p>
              </div>
              <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-fg drop-shadow-sm md:text-6xl lg:text-7xl">
                Know exactly where your shipment gets too hot —{" "}
                <span className="text-signal">
                  before it does.
                </span>
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-slate-700 drop-shadow-sm md:text-xl">
                MediGuard AI reads live temperature data along your route and tells you exactly which segments need cooling — for{" "}
                <span className="font-semibold text-fg">insulin</span>,{" "}
                <span className="font-semibold text-fg">vaccines</span>,{" "}
                <span className="font-semibold text-fg">blood</span>, and{" "}
                <span className="font-semibold text-fg">organs</span>.
              </p>
              <div className="mt-12 flex flex-wrap items-center gap-4">
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-2 rounded-md bg-signal px-8 py-4 font-semibold text-white shadow-md transition-all duration-300 hover:bg-signal-light"
                >
                  Start Assessment
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-white/90 backdrop-blur-sm px-8 py-4 font-medium text-fg shadow-sm transition-all duration-300 hover:bg-white"
                >
                  See how it works
                </a>
              </div>
            </div>
            
            {/* Right: Clinical Dashboard (Light) */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-xl border border-border bg-white p-8 shadow-2xl">
                <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-muted">Active Shipment</p>
                    <h3 className="font-display text-xl font-bold text-fg">Phoenix → Denver</h3>
                  </div>
                  <span className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-1 text-xs font-medium text-risk-critical border border-red-100">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-risk-critical"></span>
                    Action Required
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg border border-red-100 bg-red-50 p-4 transition-colors hover:bg-red-100/50">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs uppercase text-risk-critical">Segment 4</span>
                      <span className="font-display text-3xl font-bold text-fg">31.9°C</span>
                    </div>
                    <p className="mt-2 text-sm text-muted">Cooling required for next 68 miles.</p>
                  </div>
                  <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 transition-colors hover:bg-amber-100/50">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs uppercase text-risk-warning">Segment 3</span>
                      <span className="font-display text-3xl font-bold text-fg">26.7°C</span>
                    </div>
                    <p className="mt-2 text-sm text-muted">Approaching threshold. Keep monitoring.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. DARK TELEMETRY TIMELINE */}
        <section className="relative mx-auto max-w-7xl px-6 py-24 bg-darkPanel">
          <div className="mb-16 text-center">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-signal-light">Hyperlocal Telemetry</p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
              Every mile accounted for.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              We don&apos;t guess by city. We read the exact road. Here is the live data for the Phoenix → Denver route.
            </p>
          </div>
          <div className="relative rounded-xl border border-slate-700 bg-darkPanel2 p-8 shadow-xl md:p-12">
            <TelemetryTimeline />
          </div>
        </section>

        {/* 4. LIGHT PROBLEM SECTION */}
        <section className="border-t border-border py-24 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 md:grid-cols-2 md:items-center">
            <div>
              <p className="mb-4 inline-block rounded-md bg-red-50 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-risk-critical border border-red-100">
                The problem
              </p>
              <h2 className="font-display text-4xl font-bold leading-tight text-fg md:text-5xl">
                City-wide weather data is killing medicine.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted">
                A refrigerated truck can pass through a 40-mile stretch of desert highway that&apos;s 15°C hotter than where it started. Most logistics tools only know the weather for the whole city — not the specific road at 2 p.m. That gap is where medicine spoils.
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border shadow-xl">
              <Image src="/images/cold-chain-truck.png" alt="Refrigerated truck" fill className="object-cover" />
            </div>
          </div>
        </section>

        {/* 5. DARK HOW IT WORKS SECTION */}
        <section id="how-it-works" className="border-t border-slate-800 py-24 bg-darkPanel">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-signal-light">How it works</p>
              <h2 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl">
                Three steps to safety.
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <StepCard step="01" title="Split the route" body="Your route is broken into ~40-mile segments, each one a real coordinate FortyGuard can read — not a citywide average." />
              <StepCard step="02" title="Read the heat" body="Every segment gets a live temperature reading for cargo type, threshold, and departure time — insulin's 8°C limit isn't blood's 4°C." />
              <StepCard step="03" title="Get one call" body="Cool only the flagged segments, or the whole route if data's incomplete — never a false 'safe' when we genuinely don't know." />
            </div>
          </div>
        </section>

        {/* 6. LIGHT CARGO SHOWCASE SECTION */}
        <section id="cargo" className="border-t border-border py-24 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 md:grid-cols-2 md:items-center">
            <div className="relative order-2 aspect-[4/3] overflow-hidden rounded-xl border border-border shadow-xl md:order-1">
              <Image src="/images/cold-storage.jpg" alt="Cold storage" fill className="object-cover" />
            </div>
            <div className="order-1 md:order-2">
              <p className="mb-4 inline-block rounded-md bg-slate-100 border border-border px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-muted">Built for what can&apos;t be replaced</p>
              <h2 className="font-display text-4xl font-bold leading-tight text-fg md:text-5xl">
                Four cargo types. <br /> Four thresholds.
              </h2>
              <div className="mt-8 grid grid-cols-2 gap-6">
                <CargoItem color="bg-risk-safe" title="Insulin" threshold="8°C" />
                <CargoItem color="bg-risk-warning" title="Vaccines" threshold="8°C" />
                <CargoItem color="bg-signal" title="Blood" threshold="4°C" />
                <CargoItem color="bg-risk-critical" title="Organs" threshold="10°C" />
              </div>
            </div>
          </div>
        </section>

        {/* 7. DARK LIVE READOUT SECTION */}
        <section id="readout" className="border-t border-slate-800 py-24 bg-darkPanel">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 md:grid-cols-2 md:items-center">
            <div>
              <p className="mb-4 inline-block rounded-md bg-signal/10 border border-signal/20 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-signal-light">What you actually see</p>
              <h2 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl">
                Not a forecast. <br /> A reading, from the road.
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-400">
                Every segment reports its own number: cargo type, threshold, margin, and a call — safe, watch, or cool now.
              </p>
              <ul className="mt-8 space-y-4 text-slate-300">
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-signal-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Live telemetry updated continuously
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-signal-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Clear actions, no guesswork
                </li>
              </ul>
            </div>
            
            {/* Custom Live Readout Dashboard (Dark) */}
            <div className="relative">
              <div className="relative rounded-xl border border-slate-700 bg-darkPanel2 p-8 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-slate-400">Live readout</p>
                    <h3 className="font-display text-xl font-bold text-white">Segment 04</h3>
                  </div>
                  <span className="flex items-center gap-2 rounded-md bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
                    Connected
                  </span>
                </div>
                <div className="py-8 text-center">
                  <p className="font-display text-7xl font-bold text-white">4.2°C</p>
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400">
                    <span className="font-medium text-signal-light">Insulin</span>
                    <span className="text-slate-600">•</span>
                    <span>threshold 8°C</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <span className="text-sm font-medium text-slate-400">System Status</span>
                  <span className="flex items-center gap-2 font-bold text-emerald-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Safe
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. LIGHT CTA SECTION */}
        <section className="border-t border-border py-24 bg-deep">
          <div className="mx-auto max-w-7xl px-6">
            <div className="relative overflow-hidden rounded-xl border border-border bg-white p-16 text-center shadow-xl">
              <div className="relative z-10">
                <h2 className="font-display text-5xl font-bold tracking-tight text-fg md:text-6xl">
                  Run your first assessment.
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
                  No account needed for the demo. Pick a route, or just describe your shipment in plain English.
                </p>
                <Link
                  href="/dashboard"
                  className="mt-10 inline-flex items-center gap-2 rounded-md bg-signal px-10 py-4 text-lg font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-signal-light"
                >
                  Get Started
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 9. DARK FOOTER */}
        <Footer />
      </div>
    </main>
  );
}

// Premium Telemetry Timeline Component (Adapted for Dark Section)
function TelemetryTimeline() {
  const segments = [
    { temp: "18.3°C", mi: "0 MI", status: "SAFE", color: "bg-risk-safe", textColor: "text-emerald-400" },
    { temp: "21.4°C", mi: "68 MI", status: "SAFE", color: "bg-risk-safe", textColor: "text-emerald-400" },
    { temp: "26.7°C", mi: "136 MI", status: "WATCH", color: "bg-risk-warning", textColor: "text-amber-400" },
    { temp: "31.9°C", mi: "204 MI", status: "COOL", color: "bg-risk-critical", textColor: "text-red-400" },
    { temp: "33.5°C", mi: "272 MI", status: "COOL", color: "bg-risk-critical", textColor: "text-red-400" },
    { temp: "24.1°C", mi: "340 MI", status: "WATCH", color: "bg-risk-warning", textColor: "text-amber-400" },
    { temp: "19.8°C", mi: "408 MI", status: "SAFE", color: "bg-risk-safe", textColor: "text-emerald-400" },
  ];

  return (
    <div className="relative w-full overflow-x-auto pb-8">
      <div className="flex min-w-[900px] items-start justify-between">
        <div className="absolute top-[24px] left-0 right-0 h-0.5 bg-slate-700" />
        <div className="absolute top-[24px] left-0 h-0.5 bg-gradient-to-r from-risk-safe via-risk-warning to-risk-critical" style={{ width: '100%' }} />
        
        {segments.map((seg, idx) => (
          <div key={idx} className="relative z-10 flex w-32 flex-col items-center pt-12">
            <div className={`absolute top-0 flex h-12 w-12 items-center justify-center rounded-full border-4 border-darkPanel2 ${seg.color} shadow-md`}>
              <span className="h-3 w-3 rounded-full bg-white"></span>
            </div>
            <div className="mt-4 w-full rounded-lg border border-slate-700 bg-darkPanel p-4 text-center transition-transform hover:scale-105">
              <p className="font-display text-2xl font-bold text-white">{seg.temp}</p>
              <p className="mt-1 font-mono text-xs text-slate-400">{seg.mi}</p>
              <div className={`mt-3 inline-block rounded-md px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider bg-darkPanel2 ${seg.textColor} shadow-sm`}>
                {seg.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Reusable Step Card Component (Adapted for Dark Section)
function StepCard({ step, title, body }: { step: string; title: string; body: string }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-700 bg-darkPanel2 p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-signal/40 hover:bg-slate-800">
      <span className="font-mono text-sm font-bold text-signal-light">
        {step}
      </span>
      <h3 className="relative mt-4 font-display text-2xl font-bold text-white">{title}</h3>
      <p className="relative mt-4 text-base leading-relaxed text-slate-400">{body}</p>
    </div>
  );
}

// Reusable Cargo Item Component (Light Section)
function CargoItem({ color, title, threshold }: { color: string; title: string; threshold: string }) {
  return (
    <div className="rounded-lg border border-border bg-slate-50 p-6 shadow-sm transition-colors hover:border-slate-300">
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-3 w-3 rounded-full ${color}`} />
        <span className="font-display text-lg font-medium text-fg">{title}</span>
      </div>
      <p className="font-mono text-sm text-muted">{threshold} threshold</p>
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