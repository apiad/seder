---
title: App SEDER — Prototype Design
date: 2026-05-30
status: draft
project: "[[App SEDER]]"
---

# App SEDER — Prototype Design

## Context

The UH sports complex ("estadio universitario") currently has a single entrance gated by a paper logbook. Once inside, anyone can use any facility. The administration wants to evolve to a system that (a) discriminates access by area, (b) integrates **reservations** with **access control**, (c) supports multiple user categories and business models (free for students, membership for community, etc.), and (d) eventually covers all eight major areas plus the multi-service central building.

The initiator on the UH side is Suilan, doing this as a favor. The voice notes that seeded this design come from a stadium administrator who is still actively figuring out the requirements ("realmente no hemos pensado en esto, pero tampoco es que yo lo tenga todo muy bien estructurado").

The deliverable is a **working prototype** that UH can install on phones and play with. The goal is to drive the requirements conversation forward with something concrete on screen — not to ship production software.

## Goals

- Give Suilan and the stadium administrator a tangible artifact they can install on a phone, share with peers, and use in meetings.
- Cover the **two most distinct area archetypes** end-to-end (reservation-by-slot vs. drop-in with category check), so almost every future area fits one of the two molds.
- Make all flows — client, admin, and "guard scan" — fully playable from a single installable bundle, with no real authentication or backend.
- Be fast to iterate on: when the stakeholder says "actually it should work like X", we can ship the change in hours.

## Non-goals (explicit out-of-scope for v0)

- Real authentication (no OAuth, no SIGENU integration, no email).
- Payments. Memberships are flags in seed data.
- Server-side persistence. Each browser holds its own state. This is a demo, not a multi-user production system.
- Native apps, push notifications.
- Fine-grained roles and permissions.
- Internationalization. UI is Spanish.

## Architecture

**Stack.** Vite + React + TypeScript + Tailwind. A single static SPA, no backend.

**Two PWAs, one origin.** The app exposes two route trees: `/cliente/*` and `/admin/*`. Each has its own `manifest.json` (distinct name, icon, theme color, `start_url`), so a user can install both PWAs on the same phone and see them as two separate apps. A small landing page at `/` redirects to the most recently used PWA, or asks which one to install.

**State.** A single `zustand` store, persisted to `localStorage` under a versioned key. State includes users, areas, reservations, and access logs. The store is shared by both PWAs because they share an origin.

**Cross-PWA sync.** A `BroadcastChannel` ("seder-events") publishes mutations as events. Each PWA subscribes and re-hydrates affected slices of state. Result: when the client makes a reservation, the admin's open dashboard updates in real time — without any backend.

**Reset.** The admin PWA exposes a "🔄 Resetear seed" button that wipes `localStorage` and re-seeds. Used by Suilan to start a clean demo.

## Data model

All entities live in the `zustand` store. Types are sketched here; final TS shapes can vary.

```ts
type Category = 'estudiante' | 'profesor' | 'trabajador' | 'caribes' | 'comunidad' | 'externo' | 'egresado';

type User = {
  id: string;
  name: string;
  category: Category;
  membership?: { area: AreaId; validUntil: ISODate };
  qrToken: string; // mock — just a stable string for "scan"
};

type Area = {
  id: AreaId;
  name: string;
  archetype: 'slot-bookable' | 'drop-in';
  schedule: { open: HHMM; close: HHMM };
  // slot-bookable only:
  slotDurationMin?: number;
  capacityPerSlot?: number;
  requiresMembership?: boolean;
  freeCategories?: Category[]; // exempt from membership requirement
  // drop-in only:
  allowedCategories?: Category[];
};

type Reservation = {
  id: string;
  userId: string;
  areaId: AreaId;
  slotStart: ISODateTime;
  status: 'active' | 'used' | 'cancelled' | 'no-show';
};

type AccessLog = {
  id: string;
  ts: ISODateTime;
  userId: string;
  areaId: AreaId;
  result: 'admit' | 'deny';
  reason?: string; // for deny
};
```

## Seed data

**Users (6).** One per useful category combination. Category values use the `Category` enum literal exactly (single canonical form, masculine).

| name   | category   | membership                 |
| ------ | ---------- | -------------------------- |
| Juan   | estudiante | —                          |
| Ana    | caribes    | — (gym access via `freeCategories`) |
| Carlos | profesor   | —                          |
| María  | comunidad  | gym (paid, válida)         |
| Pedro  | externo    | —                          |
| Lucía  | egresado   | gym (paid, válida)         |

**Areas (2).**

- **Gimnasio de pesas** — `slot-bookable`, 6:00–22:00, slots de 60min, capacidad 8, requiere membresía, `freeCategories: ['caribes']`.
- **Cafetería Caribes** — `drop-in`, 7:00–21:00, `allowedCategories: ['estudiante','profesor','trabajador','caribes','comunidad','externo','egresado']` (es decir, todos).

**Pre-populated reservations.** ~4 reservations spread across today's slots so the admin dashboard has data on first load. One of them is past, one is current, two are future.

**Access logs.** Empty at seed time. Filled as scans happen.

## Area archetypes — business rules

### Gimnasio (slot-bookable + membership)

- User reserves a slot (e.g., 9:00–10:00).
- Each slot has capacity 8. Reservations beyond capacity are rejected at booking time.
- Eligibility: `user.membership.area == areaId && validUntil > now` OR `user.category in area.freeCategories`.
- On simulated scan:
  - Reservation lookup for `(userId, areaId, slot enclosing now)`.
  - If found and within ±10min of slot start → admit, mark reservation `used`, log.
  - If not found → deny with reason `"sin reserva"`.
  - If outside ±10min window → deny with reason `"fuera de ventana"`.
  - If membership lapsed (and user not in `freeCategories`) → deny with reason `"membresía expirada"`.
- No-show: 15min after slot start without admit → reservation flips to `no-show`, slot capacity frees up (currently informational; with capacity 8 it rarely matters in the demo).
- Cancellation window: up to 1h before slot start.

### Cafetería (drop-in + category check)

- No reservation.
- Client opens the "Mi QR" screen; admin presses "simular escaneo" for that user.
- Eligibility: `user.category in area.allowedCategories` AND `now within area.schedule`.
- If admitted → log entry.
- If denied → reason is `"categoría no admitida"` or `"fuera de horario"`.
- No capacity limit in v0.

## User flows

**Client PWA flow (typical):**

1. Open PWA → select user (mock login).
2. Land on Home: greeting, next reservation, "áreas disponibles" list.
3. Tap an area → see slots (gym) or "está abierto" (café).
4. (Gym only) Pick slot → confirm → see in "Mis reservas".
5. At arrival time → open "Mi QR".

**Admin PWA flow (typical):**

1. Open PWA → select operator (mock).
2. Land on Dashboard: counters and live event stream.
3. Tap "Escáner" → see user list with current location/reservation → simulate scan for one of them → see admit/deny animation with reason.
4. Tap "Reservas" or "Usuarios" to drill into state.

## Screens

**Client PWA (6).**

1. Selector de usuario.
2. Home (saludo, próxima reserva, áreas).
3. Detalle de área (slots o "abierto").
4. Reservar slot (gimnasio).
5. Mis reservas (con cancelar).
6. Mi QR.

**Admin PWA (6).**

1. Selector de operador.
2. Dashboard (entradas hoy, reservas hoy, ocupación gym ahora, stream en vivo).
3. Áreas (lista con estado).
4. Reservas (tabla cronológica, cancelar/reasignar).
5. Escáner simulado (lista de usuarios + botón "simular escaneo" + animación admit/deny).
6. Usuarios (padrón con categorías, membresías, log de entradas por usuario).

## Deployment

**GitHub Pages from `main`.** A workflow on push to `main` builds the SPA and publishes to Pages. URL is something like `https://apiad.github.io/seder/` (final URL TBD when the repo is pushed; routes adjust via Vite `base`).

**Migration path.** When the prototype matures, move to `seder.syalia.dev` (Caddy on the VPS, static bucket or `apt-rsync`). No code change required — just origin.

## Repo conventions

- **Language.** UI strings: Spanish. Code identifiers, comments, commit messages: English.
- **Branch policy.** Work directly on `main` for this prototype (per Alex's convention for fast-moving solo work). PRs not required; tests still apply where they make sense.
- **Tests.** A minimal `vitest` suite covers the business rules (eligibility, scan outcomes, no-show transitions). Screen tests are out of scope unless they pay back the iteration cost.

## Open questions / future work

- **What "SEDER" stands for.** Acronym still unknown; ask Suilan.
- **Real area inventory.** Once we know which actual areas are operative on day one, swap the seed data for the real list — no architecture change required as long as each new area maps to one of the two archetypes.
- **Pool / capacity-limited drop-in.** The piscina probably wants a third archetype (drop-in with simultaneous-capacity limit). Defer until needed.
- **SIGENU sync.** When/if we want the student carnet to act as the QR, this becomes a real backend project. Out of v0; documented for future.
- **Per-area access logs viewable by area-admin.** Currently logs are admin-global. If different areas end up with different operators, per-area scoping matters.
- **Egresados onboarding.** The voice note flagged this as "complicado". Defer until the v0 demo surfaces what model fits.
