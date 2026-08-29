"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/dashboard", label: "Assess" },
  { href: "/history", label: "History" },
  { href: "/environment", label: "Environment" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-deep/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 font-display text-lg font-bold text-fg"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-signal text-sm font-bold text-deep shadow-glow">
            +
          </span>
          MediGuard AI
        </Link>

        <div className="hidden items-center gap-8 text-sm md:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 transition ${
                  active ? "text-signal" : "text-muted hover:text-fg"
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute -bottom-[17px] left-0 right-0 h-[2px] rounded-full bg-signal shadow-glow" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden rounded-lg bg-signal px-4 py-2 text-sm font-semibold text-deep shadow-glow transition hover:bg-signal/90 hover:shadow-[0_0_36px_-6px_rgba(34,211,238,0.6)] sm:inline-block"
          >
            Start assessment
          </Link>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-fg transition hover:border-signal/40 md:hidden"
          >
            <span className="relative block h-3.5 w-4">
              <span
                className={`absolute left-0 h-[1.5px] w-4 bg-fg transition-all duration-200 ${
                  open ? "top-[6px] rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-[6px] h-[1.5px] w-4 bg-fg transition-opacity duration-150 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 h-[1.5px] w-4 bg-fg transition-all duration-200 ${
                  open ? "top-[6px] -rotate-45" : "top-[12px]"
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* mobile menu */}
      <div
        className={`overflow-hidden border-t border-white/[0.06] bg-deep/95 backdrop-blur-md transition-all duration-200 md:hidden ${
          open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-6 py-4 text-sm">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2 transition ${
                  active
                    ? "bg-signal/10 text-signal"
                    : "text-muted hover:bg-white/5 hover:text-fg"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-lg bg-signal px-3 py-2 text-center font-semibold text-deep shadow-glow"
          >
            Start assessment
          </Link>
        </div>
      </div>
    </header>
  );
}
