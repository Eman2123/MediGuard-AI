# MediGuard AI

<p align="center">
  <img src="assets/mediguard-logo.svg" alt="MediGuard AI" width="650">
</p>

<p align="center">
  <strong>Agentic route intelligence for life-critical medical cargo</strong>
</p>

Agentic route intelligence for life-critical medical cargo (insulin, vaccines,
blood products, plasma, and transplant organs). Segments a shipment route,
pulls hyperlocal FortyGuard temperature data per segment, checks it against
cargo-specific thresholds, and returns a cost-quantified mitigation
recommendation. Built for the FortyGuard Global AI Hackathon 2026.

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your keys:
   ```
   cp .env.example .env
   ```
3. Run the dev server:
   ```
   npm run dev
   ```

## Project structure

- `app/api/chat/route.ts` - agent chat endpoint (Vercel AI SDK, streaming)
- `app/api/tools/` - the five agent tools (segment_route, get_route_heatmap,
  assess_cargo_risk, calculate_mitigation_cost, monitor_portfolio)
- `lib/fortyguard-client.ts` - FortyGuard API wrapper (auth + async submit/poll)
- `data/cargo_db.json` - 24-item medical cargo database with storage
  thresholds and (for organs) absolute transport-time limits

## Before Day 3

Run the empirical AOI-size test (see the execution plan / notebooks/01) to
confirm the Hackathon plan's actual heatmap area limit before finalizing
route-segmentation granularity in `app/api/tools/segment-route.ts`.

## Status

Day 1 scaffold. Tool files under `app/api/tools/` are stubs with TODO
comments matching the execution plan - fill them in as each day's work
begins.
