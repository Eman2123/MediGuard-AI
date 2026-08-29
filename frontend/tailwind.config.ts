import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light Theme Base (70% Light)
        deep: "#F8FAFC",           // Soft Light Background (Slate 50)
        panel: "#FFFFFF",          // Pure White Cards
        panel2: "#F1F5F9",         // Light Slate Hover State
        border: "#E2E8F0",         // Soft Light Borders
        
        // Dark Sections (30% Dark - Header, Footer, Alternating Sections)
        darkPanel: "#0F172A",      // Slate 900 (Dark Background)
        darkPanel2: "#1E293B",     // Slate 800 (Dark Cards/Hover)
        
        // Medical Accent (Decent Teal)
        signal: "#0D9488",         // Teal 600 (Primary Buttons/Links)
        "signal-light": "#14B8A6", // Teal 500 (Hover State)
        
        // Typography Colors
        muted: "#64748B",          // Slate 500 (Paragraph Text)
        fg: "#0F172A",             // Slate 900 (Main Heading Text)
        
        // Risk Indicators (Standard & Decent)
        risk: {
          critical: "#DC2626",     // Red
          warning: "#D97706",      // Amber
          safe: "#059669",         // Emerald
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;