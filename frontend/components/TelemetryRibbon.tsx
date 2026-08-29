type Reading = {
  km: string;
  temp: number;
  risk: "safe" | "warning" | "critical";
};

const READINGS: Reading[] = [
  { km: "0", temp: 18.3, risk: "safe" },
  { km: "68", temp: 21.4, risk: "safe" },
  { km: "136", temp: 26.7, risk: "warning" },
  { km: "204", temp: 31.9, risk: "critical" },
  { km: "272", temp: 33.5, risk: "critical" },
  { km: "340", temp: 24.1, risk: "warning" },
  { km: "408", temp: 19.8, risk: "safe" },
];

const RISK_STYLES: Record<
  Reading["risk"],
  { dot: string; glow: string; text: string; label: string }
> = {
  safe: {
    dot: "bg-risk-safe",
    glow: "shadow-[0_0_10px_1px_rgba(52,211,153,0.55)]",
    text: "text-risk-safe",
    label: "SAFE",
  },
  warning: {
    dot: "bg-risk-warning",
    glow: "shadow-[0_0_10px_1px_rgba(251,191,36,0.55)]",
    text: "text-risk-warning",
    label: "WATCH",
  },
  critical: {
    dot: "bg-risk-critical",
    glow: "shadow-[0_0_10px_1px_rgba(251,91,91,0.6)]",
    text: "text-risk-critical",
    label: "COOL",
  },
};

export default function TelemetryRibbon() {
  return (
    <div
      role="img"
      aria-label="Sample route telemetry: temperature readings rise from safe to critical across a shipment's path, then cool again."
      className="w-full overflow-x-auto"
    >
      <div className="relative flex min-w-[720px] items-end justify-between px-4 py-10 md:min-w-0">
        {/* connecting line — a thermal gradient from safe to critical and back */}
        <div className="absolute left-4 right-4 top-[52px] h-px bg-signal-line opacity-70" />

        {READINGS.map((r, i) => {
          const s = RISK_STYLES[r.risk];
          const isLast = i === READINGS.length - 1;
          return (
            <div key={r.km} className="relative z-10 flex flex-col items-center gap-2">
              <span className={`font-mono text-xs ${s.text}`}>{r.temp.toFixed(1)}°C</span>
              <span
                className={`h-2.5 w-2.5 rounded-full ${s.dot} ${s.glow} ${
                  isLast ? "pulse-dot" : ""
                }`}
              />
              <span className="font-mono text-[10px] tracking-wide text-muted">
                {r.km} MI
              </span>
              <span className={`font-mono text-[10px] font-medium tracking-wider ${s.text}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
