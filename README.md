# SEDER

Prototype access-control and reservation app for the UH stadium. Two PWAs (`cliente` + `admin`) on a single Vite/React/TS SPA, `localStorage`-only, mocked end-to-end. Designed as a demo-driven artifact: real surfaces, no backend, so UH stakeholders can play with concrete flows and discover what the real system needs to be.

See [`docs/superpowers/specs/2026-05-30-app-seder-prototype-design.md`](docs/superpowers/specs/2026-05-30-app-seder-prototype-design.md) for the design and [`docs/superpowers/plans/2026-05-30-app-seder-prototype.md`](docs/superpowers/plans/2026-05-30-app-seder-prototype.md) for the implementation plan. Project node in vault: `vault/Efforts/Projects/App SEDER.md`.

## Run locally

```bash
npm install
npm run dev
```

- Cliente PWA: <http://localhost:5173/>
- Admin PWA:   <http://localhost:5173/admin.html>

Install both on a phone via Chrome's "Add to Home Screen" — they appear as separate apps.

## Demo recipe

1. Open **Cliente** PWA → pick **María**. She has a gym membership.
2. Go to **Gimnasio de pesas** → reserve any future slot.
3. Open **Admin** PWA in another tab → **Dashboard** shows the new reservation appear live.
4. Admin → **Escáner**: pick María + Gimnasio + click "Simular escaneo". Result depends on whether `now` is within ±10min of a slot start. Try at varying times to see admit / "fuera de ventana" / "sin reserva".
5. Try as **Juan** (estudiante): gym scan denies with "membresía expirada"; cafetería scan admits.
6. Click **🔄 Resetear seed** in admin header to reset the demo.

## Test

```bash
npm test
```

Covers business rules in `src/domain/*`. Screens are validated by hand.
