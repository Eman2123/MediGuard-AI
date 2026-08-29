# MediGuard AI — Frontend

Next.js 14 + Tailwind CSS frontend for the MediGuard AI backend.

## Setup

```bash
npm install
npm run dev
```

Opens at http://localhost:3000. The backend must be running at
http://localhost:8000 — `next.config.js` proxies `/api/*` requests there,
so no CORS setup is needed in dev.

## Pages

- `/` — landing page (hero video, problem framing, telemetry ribbon, how it works)
- `/dashboard` — natural-language shipment assessment (`/api/smart-assess`)
- `/history` — recent assessments (`/api/history`)
- `/environment` — heat index / AQI / solar lookup (`/api/env-params`)

## Design tokens

Colors, fonts, and the signature "telemetry ribbon" component are defined in
`tailwind.config.ts` and `components/TelemetryRibbon.tsx`. Update
`READINGS` in that file to reflect a real demo route before recording video.

## Before recording the demo video

1. Confirm `npm run dev` boots cleanly with the backend running.
2. Test `/dashboard` with a real `user_input` string — this hits FortyGuard
   and consumes credits.
3. Run at least one assessment before showing `/history` (it starts empty).
