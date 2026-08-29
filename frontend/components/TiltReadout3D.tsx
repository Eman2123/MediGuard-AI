"use client";

import { useRef, useState } from "react";

/**
 * A mouse-tracked 3D tilt card showing a live "device readout" mockup —
 * layered with translateZ so the gauge, badge and route line float at
 * different depths as the card tilts toward the cursor.
 */
export default function TiltReadout3D() {
  const ref = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 50 });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setRotate({ x: (py - 0.5) * -14, y: (px - 0.5) * 16 });
    setGlow({ x: px * 100, y: py * 100 });
  }

  function handleLeave() {
    setRotate({ x: 0, y: 0 });
    setGlow({ x: 50, y: 50 });
  }

  return (
    <div
      className="[perspective:1200px]"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div
        ref={ref}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
        }}
        className="relative aspect-[4/3] w-full rounded-2xl border border-white/10 bg-panel2 shadow-2xl shadow-black/50"
      >
        {/* ambient cursor glow, sits flat on the card */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-70 transition-opacity"
          style={{
            background: `radial-gradient(240px circle at ${glow.x}% ${glow.y}%, rgba(34,211,238,0.16), transparent 60%)`,
          }}
        />

        {/* base grid texture, translateZ(0) */}
        <div
          className="absolute inset-0 rounded-2xl opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            transform: "translateZ(1px)",
          }}
        />

        {/* header row, translateZ(30px) */}
        <div
          style={{ transform: "translateZ(30px)" }}
          className="absolute left-6 top-6 right-6 flex items-center justify-between"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            Live readout — Segment 04
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-risk-safe">
            <span className="h-1.5 w-1.5 rounded-full bg-risk-safe pulse-dot" />
            Connected
          </span>
        </div>

        {/* big temp number, translateZ(55px) — the most "lifted" layer */}
        <div
          style={{ transform: "translateZ(55px)" }}
          className="absolute left-6 top-16"
        >
          <p className="font-display text-5xl font-bold text-fg md:text-6xl">
            4.2<span className="text-2xl text-muted">°C</span>
          </p>
          <p className="mt-1 font-mono text-xs text-muted">
            Insulin · threshold 8°C · margin 3.8°C
          </p>
        </div>

        {/* floating risk badge, translateZ(70px), casts its own shadow */}
        <div
          style={{ transform: "translateZ(70px)" }}
          className="absolute right-6 top-16 rounded-lg border border-risk-safe/40 bg-risk-safe/10 px-3 py-1.5 shadow-lg shadow-black/40"
        >
          <p className="font-mono text-[11px] font-semibold tracking-wider text-risk-safe">
            SAFE
          </p>
        </div>

        {/* mini route line, translateZ(45px) */}
        <div
          style={{ transform: "translateZ(45px)" }}
          className="absolute bottom-6 left-6 right-6"
        >
          <div className="h-px w-full bg-signal-line opacity-80" />
          <div className="mt-2 flex justify-between font-mono text-[10px] text-muted">
            <span>PHX · 0 MI</span>
            <span className="text-signal">segment 04 / 12</span>
            <span>DEN · 836 MI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
