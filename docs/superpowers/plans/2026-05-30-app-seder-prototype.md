# App SEDER Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a two-PWA prototype (client + admin) for stadium access control + reservations, with two mocked area archetypes (slot-bookable gym + drop-in cafeteria), no backend, deployable to GitHub Pages.

**Architecture:** Single Vite/React/TS SPA serving two route trees (`/cliente/*`, `/admin/*`), each with its own `manifest.json`. State lives in a `zustand` store persisted to `localStorage`, synchronized across PWAs via `BroadcastChannel`. Business rules (eligibility, scan outcomes, no-show transitions) live in pure functions in `src/domain/` and are TDD-tested with `vitest`. Screens are not unit-tested — manual play is the validation.

**Tech Stack:** Vite 5, React 18, TypeScript 5, Tailwind 4 (vite plugin), react-router-dom 6, zustand 4, vitest 1, qrcode.react. Node 20+. UI in Spanish, code/identifiers in English.

**Spec reference:** `docs/superpowers/specs/2026-05-30-app-seder-prototype-design.md`.

**Vertical slice 1 (Tasks 1–10):** scaffold + types + seed + business rules + store + routing. End state: app boots, both PWA routes serve a placeholder page, store hydrates seed data on first load. No screens yet but business logic is complete and tested.

**Vertical slice 2 (Tasks 11–17):** the thinnest playable end-to-end flow — user selects identity, reserves a gym slot, opens QR; admin opens scanner, simulates scan, sees admit/deny.

**Vertical slice 3 (Tasks 18–24):** remaining cliente + admin screens, reset, polish.

**Vertical slice 4 (Tasks 25–26):** deploy to GitHub Pages + smoke notes for Suilan.

---

## File Structure

```
seder/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js              (omitted with Tailwind 4)
├── postcss.config.js               (omitted with Tailwind 4 vite plugin)
├── index.html                      (cliente entry, links cliente.webmanifest)
├── admin.html                      (admin entry, links admin.webmanifest)
├── public/
│   ├── cliente.webmanifest
│   ├── admin.webmanifest
│   ├── icon-cliente-192.png
│   ├── icon-cliente-512.png
│   ├── icon-admin-192.png
│   └── icon-admin-512.png
├── src/
│   ├── domain/
│   │   ├── types.ts                (Category, User, Area, Reservation, AccessLog, etc.)
│   │   ├── seed.ts                 (buildSeed() → initial state)
│   │   ├── eligibility.ts          (canReserveGym, canEnterDropIn)
│   │   ├── scan.ts                 (evaluateGymScan, evaluateDropInScan)
│   │   ├── reservations.ts         (createReservation, cancelReservation, advanceNoShows)
│   │   └── time.ts                 (ISO/HHMM helpers, slot math, "now" injection)
│   ├── store/
│   │   ├── index.ts                (zustand store + persist + actions)
│   │   └── broadcast.ts            (BroadcastChannel middleware)
│   ├── ui/
│   │   ├── shells/
│   │   │   ├── ClienteShell.tsx
│   │   │   └── AdminShell.tsx
│   │   ├── cliente/
│   │   │   ├── SelectUser.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── AreaDetail.tsx
│   │   │   ├── ReserveSlot.tsx
│   │   │   ├── MyReservations.tsx
│   │   │   └── MyQR.tsx
│   │   ├── admin/
│   │   │   ├── SelectOperator.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Areas.tsx
│   │   │   ├── Reservations.tsx
│   │   │   ├── Scanner.tsx
│   │   │   └── Users.tsx
│   │   └── components/
│   │       ├── ScanResultBanner.tsx
│   │       └── ResetSeedButton.tsx
│   ├── main-cliente.tsx            (cliente entry: renders <ClienteApp/>)
│   ├── main-admin.tsx              (admin entry: renders <AdminApp/>)
│   ├── ClienteApp.tsx              (router for /cliente/*)
│   ├── AdminApp.tsx                (router for /admin/*)
│   └── index.css                   (tailwind directives)
├── tests/
│   ├── seed.test.ts
│   ├── eligibility.test.ts
│   ├── scan.test.ts
│   └── reservations.test.ts
└── .github/workflows/deploy.yml
```

Two HTML entry points (`index.html` for `/cliente/`, `admin.html` for `/admin/`) is the cleanest way to attach two distinct manifests under one Vite build. Each loads its own `main-*.tsx`. `vite.config.ts` uses `rollupOptions.input` to register both.

---

## Conventions

- **Commit style.** Conventional commits with `seder` scope: `feat(seder): ...`, `test(seder): ...`, `chore(seder): ...`, `docs(seder): ...`. Commit after each task completes.
- **Branch.** `main`. No PRs. Push after each task or each batch — your call.
- **Time injection.** Domain functions take `now: Date` as last parameter. Never call `new Date()` inside domain code. Tests fix `now` to deterministic values.
- **IDs.** `crypto.randomUUID()` for new IDs in actions. Seed IDs are hard-coded short strings ("u-juan", "r-001", etc.) so tests can reference them.

---

## Task 1: Scaffold Vite + React + TS + Tailwind

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `admin.html`, `src/main-cliente.tsx`, `src/main-admin.tsx`, `src/index.css`, `src/ClienteApp.tsx`, `src/AdminApp.tsx`

- [ ] **Step 1: Initialize npm package**

Run from `repos/seder/`:

```bash
npm init -y
npm pkg set type=module
npm pkg set scripts.dev="vite"
npm pkg set scripts.build="tsc -b && vite build"
npm pkg set scripts.preview="vite preview"
npm pkg set scripts.test="vitest run"
npm pkg set scripts.test:watch="vitest"
```

- [ ] **Step 2: Install deps**

```bash
npm install react react-dom react-router-dom zustand qrcode.react
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom \
  tailwindcss @tailwindcss/vite \
  vitest jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "types": ["vitest/globals"]
  },
  "include": ["src", "tests"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Write `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "skipLibCheck": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Write `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        cliente: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
});
```

- [ ] **Step 6: Write `index.html` (cliente entry)**

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="manifest" href="/cliente.webmanifest" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0f766e" />
    <title>SEDER · Cliente</title>
  </head>
  <body class="bg-slate-50">
    <div id="root"></div>
    <script type="module" src="/src/main-cliente.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Write `admin.html` (admin entry)**

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="manifest" href="/admin.webmanifest" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#9333ea" />
    <title>SEDER · Admin</title>
  </head>
  <body class="bg-slate-900 text-slate-100">
    <div id="root"></div>
    <script type="module" src="/src/main-admin.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Write `src/index.css`**

```css
@import "tailwindcss";
```

- [ ] **Step 9: Write `src/ClienteApp.tsx` (placeholder)**

```tsx
export default function ClienteApp() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold text-teal-700">SEDER · Cliente</h1>
      <p className="mt-2 text-slate-600">Boot OK.</p>
    </main>
  );
}
```

- [ ] **Step 10: Write `src/AdminApp.tsx` (placeholder)**

```tsx
export default function AdminApp() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold text-purple-400">SEDER · Admin</h1>
      <p className="mt-2 text-slate-400">Boot OK.</p>
    </main>
  );
}
```

- [ ] **Step 11: Write `src/main-cliente.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import ClienteApp from './ClienteApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClienteApp />
  </StrictMode>
);
```

- [ ] **Step 12: Write `src/main-admin.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AdminApp from './AdminApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>
);
```

- [ ] **Step 13: Smoke test the dev server**

```bash
npm run dev
```

Expected: Vite serves both routes. Open `http://localhost:5173/` (cliente) and `http://localhost:5173/admin.html` (admin). Both show their placeholder pages with correct colors. Kill the dev server.

- [ ] **Step 14: Commit**

```bash
git add package.json package-lock.json tsconfig.json tsconfig.node.json vite.config.ts \
  index.html admin.html src/
git commit -m "feat(seder): scaffold Vite + React + TS + Tailwind with two HTML entry points"
```

---

## Task 2: Domain types

**Files:**
- Create: `src/domain/types.ts`

- [ ] **Step 1: Write `src/domain/types.ts`**

```ts
export type ISODate = string;       // 'YYYY-MM-DD'
export type ISODateTime = string;   // 'YYYY-MM-DDTHH:mm:ss'
export type HHMM = string;          // 'HH:mm'
export type AreaId = string;
export type UserId = string;
export type ReservationId = string;
export type AccessLogId = string;

export type Category =
  | 'estudiante'
  | 'profesor'
  | 'trabajador'
  | 'caribes'
  | 'comunidad'
  | 'externo'
  | 'egresado';

export type Membership = {
  area: AreaId;
  validUntil: ISODate;
};

export type User = {
  id: UserId;
  name: string;
  category: Category;
  membership?: Membership;
  qrToken: string;
};

export type AreaArchetype = 'slot-bookable' | 'drop-in';

export type Area = {
  id: AreaId;
  name: string;
  archetype: AreaArchetype;
  schedule: { open: HHMM; close: HHMM };
  slotDurationMin?: number;          // slot-bookable only
  capacityPerSlot?: number;          // slot-bookable only
  requiresMembership?: boolean;      // slot-bookable only
  freeCategories?: Category[];       // slot-bookable only — exempt from membership
  allowedCategories?: Category[];    // drop-in only
};

export type ReservationStatus = 'active' | 'used' | 'cancelled' | 'no-show';

export type Reservation = {
  id: ReservationId;
  userId: UserId;
  areaId: AreaId;
  slotStart: ISODateTime;
  status: ReservationStatus;
};

export type AccessLog = {
  id: AccessLogId;
  ts: ISODateTime;
  userId: UserId;
  areaId: AreaId;
  result: 'admit' | 'deny';
  reason?: string;
};

export type DenyReason =
  | 'sin reserva'
  | 'fuera de ventana'
  | 'membresía expirada'
  | 'categoría no admitida'
  | 'fuera de horario';

export type ScanResult =
  | { result: 'admit' }
  | { result: 'deny'; reason: DenyReason };

export type AppState = {
  users: User[];
  areas: Area[];
  reservations: Reservation[];
  accessLogs: AccessLog[];
  activeUserId?: UserId;          // cliente PWA only
  activeOperatorName?: string;    // admin PWA only
};
```

- [ ] **Step 2: Commit**

```bash
git add src/domain/types.ts
git commit -m "feat(seder): domain types — User, Area, Reservation, AccessLog, ScanResult"
```

---

## Task 3: Time helpers

**Files:**
- Create: `src/domain/time.ts`, `tests/setup.ts`, `tests/time.test.ts`

- [ ] **Step 1: Write `tests/setup.ts`**

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 2: Write `tests/time.test.ts` (failing)**

```ts
import { describe, it, expect } from 'vitest';
import { hhmmToMinutes, isWithinSchedule, minutesBetween, slotEnclosing } from '../src/domain/time';

describe('hhmmToMinutes', () => {
  it('parses HH:mm', () => {
    expect(hhmmToMinutes('06:00')).toBe(360);
    expect(hhmmToMinutes('22:30')).toBe(1350);
  });
});

describe('isWithinSchedule', () => {
  it('returns true at open boundary', () => {
    expect(isWithinSchedule(new Date('2026-05-30T07:00:00'), { open: '07:00', close: '21:00' })).toBe(true);
  });
  it('returns false at close boundary', () => {
    expect(isWithinSchedule(new Date('2026-05-30T21:00:00'), { open: '07:00', close: '21:00' })).toBe(false);
  });
  it('returns false before open', () => {
    expect(isWithinSchedule(new Date('2026-05-30T06:59:00'), { open: '07:00', close: '21:00' })).toBe(false);
  });
});

describe('minutesBetween', () => {
  it('returns signed delta in minutes', () => {
    expect(minutesBetween(new Date('2026-05-30T09:00:00'), new Date('2026-05-30T09:10:00'))).toBe(10);
    expect(minutesBetween(new Date('2026-05-30T09:10:00'), new Date('2026-05-30T09:00:00'))).toBe(-10);
  });
});

describe('slotEnclosing', () => {
  it('snaps to the hour boundary for 60-min slots', () => {
    expect(slotEnclosing(new Date('2026-05-30T09:42:00'), 60)).toBe('2026-05-30T09:00:00');
  });
});
```

- [ ] **Step 3: Run failing test**

```bash
npm test -- tests/time.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 4: Write `src/domain/time.ts`**

```ts
import type { HHMM, ISODateTime } from './types';

export function hhmmToMinutes(hhmm: HHMM): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function isWithinSchedule(now: Date, schedule: { open: HHMM; close: HHMM }): boolean {
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= hhmmToMinutes(schedule.open) && minutes < hhmmToMinutes(schedule.close);
}

export function minutesBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 60_000);
}

export function slotEnclosing(now: Date, slotDurationMin: number): ISODateTime {
  const totalMin = now.getHours() * 60 + now.getMinutes();
  const slotIndex = Math.floor(totalMin / slotDurationMin);
  const slotMin = slotIndex * slotDurationMin;
  const d = new Date(now);
  d.setHours(Math.floor(slotMin / 60), slotMin % 60, 0, 0);
  return formatISO(d);
}

export function formatISO(d: Date): ISODateTime {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test -- tests/time.test.ts
```

Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add tests/setup.ts tests/time.test.ts src/domain/time.ts
git commit -m "feat(seder): time helpers (hhmm parsing, schedule check, slot snapping)"
```

---

## Task 4: Seed data

**Files:**
- Create: `src/domain/seed.ts`, `tests/seed.test.ts`

- [ ] **Step 1: Write `tests/seed.test.ts` (failing)**

```ts
import { describe, it, expect } from 'vitest';
import { buildSeed, AREA_GIMNASIO, AREA_CAFETERIA } from '../src/domain/seed';

describe('buildSeed', () => {
  const state = buildSeed(new Date('2026-05-30T12:00:00'));

  it('has 6 users with unique categories', () => {
    expect(state.users).toHaveLength(6);
    const cats = state.users.map(u => u.category);
    expect(new Set(cats).size).toBe(6);
  });

  it('has 2 areas: gym (slot-bookable) and cafeteria (drop-in)', () => {
    expect(state.areas).toHaveLength(2);
    const gym = state.areas.find(a => a.id === AREA_GIMNASIO)!;
    expect(gym.archetype).toBe('slot-bookable');
    expect(gym.capacityPerSlot).toBe(8);
    expect(gym.slotDurationMin).toBe(60);
    expect(gym.requiresMembership).toBe(true);
    expect(gym.freeCategories).toEqual(['caribes']);
    expect(gym.schedule).toEqual({ open: '06:00', close: '22:00' });

    const cafe = state.areas.find(a => a.id === AREA_CAFETERIA)!;
    expect(cafe.archetype).toBe('drop-in');
    expect(cafe.allowedCategories).toContain('estudiante');
    expect(cafe.allowedCategories).toContain('externo');
    expect(cafe.schedule).toEqual({ open: '07:00', close: '21:00' });
  });

  it('has María (comunidad) with valid gym membership', () => {
    const maria = state.users.find(u => u.name === 'María')!;
    expect(maria.category).toBe('comunidad');
    expect(maria.membership).toBeDefined();
    expect(maria.membership!.area).toBe(AREA_GIMNASIO);
  });

  it('has Ana (caribes) without explicit membership', () => {
    const ana = state.users.find(u => u.name === 'Ana')!;
    expect(ana.category).toBe('caribes');
    expect(ana.membership).toBeUndefined();
  });

  it('has 4 pre-populated reservations spread across today', () => {
    expect(state.reservations).toHaveLength(4);
    state.reservations.forEach(r => {
      expect(r.areaId).toBe(AREA_GIMNASIO);
      expect(r.status).toBe('active');
    });
  });

  it('starts with empty access logs', () => {
    expect(state.accessLogs).toEqual([]);
  });
});
```

- [ ] **Step 2: Run failing test**

```bash
npm test -- tests/seed.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Write `src/domain/seed.ts`**

```ts
import type { AppState, User, Area, Reservation } from './types';

export const AREA_GIMNASIO = 'a-gimnasio';
export const AREA_CAFETERIA = 'a-cafeteria';

export function buildSeed(now: Date): AppState {
  const today = now.toISOString().slice(0, 10);
  const farFuture = '2099-12-31';

  const areas: Area[] = [
    {
      id: AREA_GIMNASIO,
      name: 'Gimnasio de pesas',
      archetype: 'slot-bookable',
      schedule: { open: '06:00', close: '22:00' },
      slotDurationMin: 60,
      capacityPerSlot: 8,
      requiresMembership: true,
      freeCategories: ['caribes'],
    },
    {
      id: AREA_CAFETERIA,
      name: 'Cafetería Caribes',
      archetype: 'drop-in',
      schedule: { open: '07:00', close: '21:00' },
      allowedCategories: [
        'estudiante', 'profesor', 'trabajador',
        'caribes', 'comunidad', 'externo', 'egresado',
      ],
    },
  ];

  const users: User[] = [
    { id: 'u-juan',   name: 'Juan',   category: 'estudiante', qrToken: 'qr-juan' },
    { id: 'u-ana',    name: 'Ana',    category: 'caribes',    qrToken: 'qr-ana' },
    { id: 'u-carlos', name: 'Carlos', category: 'profesor',   qrToken: 'qr-carlos' },
    { id: 'u-maria',  name: 'María',  category: 'comunidad',  qrToken: 'qr-maria',
      membership: { area: AREA_GIMNASIO, validUntil: farFuture } },
    { id: 'u-pedro',  name: 'Pedro',  category: 'externo',    qrToken: 'qr-pedro' },
    { id: 'u-lucia',  name: 'Lucía',  category: 'egresado',   qrToken: 'qr-lucia',
      membership: { area: AREA_GIMNASIO, validUntil: farFuture } },
  ];

  const reservations: Reservation[] = [
    { id: 'r-001', userId: 'u-ana',   areaId: AREA_GIMNASIO, slotStart: `${today}T08:00:00`, status: 'active' },
    { id: 'r-002', userId: 'u-maria', areaId: AREA_GIMNASIO, slotStart: `${today}T12:00:00`, status: 'active' },
    { id: 'r-003', userId: 'u-ana',   areaId: AREA_GIMNASIO, slotStart: `${today}T18:00:00`, status: 'active' },
    { id: 'r-004', userId: 'u-lucia', areaId: AREA_GIMNASIO, slotStart: `${today}T19:00:00`, status: 'active' },
  ];

  return { users, areas, reservations, accessLogs: [] };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/seed.test.ts
```

Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add tests/seed.test.ts src/domain/seed.ts
git commit -m "feat(seder): seed data — 6 users, 2 areas, 4 pre-populated reservations"
```

---

## Task 5: Eligibility predicates

**Files:**
- Create: `src/domain/eligibility.ts`, `tests/eligibility.test.ts`

- [ ] **Step 1: Write `tests/eligibility.test.ts` (failing)**

```ts
import { describe, it, expect } from 'vitest';
import { canReserveGym, canEnterDropIn } from '../src/domain/eligibility';
import { buildSeed, AREA_GIMNASIO, AREA_CAFETERIA } from '../src/domain/seed';

const now = new Date('2026-05-30T10:00:00');
const state = buildSeed(now);
const gym = state.areas.find(a => a.id === AREA_GIMNASIO)!;
const cafe = state.areas.find(a => a.id === AREA_CAFETERIA)!;
const userBy = (name: string) => state.users.find(u => u.name === name)!;

describe('canReserveGym', () => {
  it('admits caribes without membership (free category)', () => {
    expect(canReserveGym(userBy('Ana'), gym, now).ok).toBe(true);
  });
  it('admits comunidad with valid membership', () => {
    expect(canReserveGym(userBy('María'), gym, now).ok).toBe(true);
  });
  it('rejects estudiante without membership', () => {
    const r = canReserveGym(userBy('Juan'), gym, now);
    expect(r.ok).toBe(false);
    expect(r.ok || r.reason).toBe('membresía expirada');
  });
  it('rejects externo without membership', () => {
    expect(canReserveGym(userBy('Pedro'), gym, now).ok).toBe(false);
  });
  it('rejects when membership has expired', () => {
    const expired = { ...userBy('María'), membership: { area: AREA_GIMNASIO, validUntil: '2020-01-01' } };
    const r = canReserveGym(expired, gym, now);
    expect(r.ok).toBe(false);
    expect(r.ok || r.reason).toBe('membresía expirada');
  });
});

describe('canEnterDropIn', () => {
  it('admits any seeded category during open hours', () => {
    for (const u of state.users) {
      expect(canEnterDropIn(u, cafe, new Date('2026-05-30T10:00:00')).ok).toBe(true);
    }
  });
  it('rejects outside hours', () => {
    const r = canEnterDropIn(userBy('Juan'), cafe, new Date('2026-05-30T22:00:00'));
    expect(r.ok).toBe(false);
    expect(r.ok || r.reason).toBe('fuera de horario');
  });
});
```

- [ ] **Step 2: Run failing test**

```bash
npm test -- tests/eligibility.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Write `src/domain/eligibility.ts`**

```ts
import type { User, Area, DenyReason } from './types';
import { isWithinSchedule } from './time';

export type Eligibility = { ok: true } | { ok: false; reason: DenyReason };

export function canReserveGym(user: User, area: Area, now: Date): Eligibility {
  if (area.freeCategories?.includes(user.category)) {
    return { ok: true };
  }
  if (!user.membership || user.membership.area !== area.id) {
    return { ok: false, reason: 'membresía expirada' };
  }
  const validUntil = new Date(user.membership.validUntil + 'T23:59:59');
  if (validUntil < now) {
    return { ok: false, reason: 'membresía expirada' };
  }
  return { ok: true };
}

export function canEnterDropIn(user: User, area: Area, now: Date): Eligibility {
  if (!isWithinSchedule(now, area.schedule)) {
    return { ok: false, reason: 'fuera de horario' };
  }
  if (!area.allowedCategories?.includes(user.category)) {
    return { ok: false, reason: 'categoría no admitida' };
  }
  return { ok: true };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/eligibility.test.ts
```

Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add tests/eligibility.test.ts src/domain/eligibility.ts
git commit -m "feat(seder): eligibility predicates for gym and drop-in"
```

---

## Task 6: Scan evaluation

**Files:**
- Create: `src/domain/scan.ts`, `tests/scan.test.ts`

- [ ] **Step 1: Write `tests/scan.test.ts` (failing)**

```ts
import { describe, it, expect } from 'vitest';
import { evaluateGymScan, evaluateDropInScan } from '../src/domain/scan';
import { buildSeed, AREA_GIMNASIO, AREA_CAFETERIA } from '../src/domain/seed';

const today = '2026-05-30';
const seedNow = new Date(`${today}T07:30:00`);
const state = buildSeed(seedNow);

describe('evaluateGymScan', () => {
  it('admits when active reservation exists within ±10min of slot start', () => {
    const now = new Date(`${today}T08:05:00`);
    const r = evaluateGymScan(state, 'u-ana', AREA_GIMNASIO, now);
    expect(r.result).toBe('admit');
  });

  it('admits when scanning exactly at slot start', () => {
    const now = new Date(`${today}T08:00:00`);
    expect(evaluateGymScan(state, 'u-ana', AREA_GIMNASIO, now).result).toBe('admit');
  });

  it('denies with "sin reserva" when user has no reservation', () => {
    const now = new Date(`${today}T08:05:00`);
    const r = evaluateGymScan(state, 'u-juan', AREA_GIMNASIO, now);
    expect(r.result).toBe('deny');
    if (r.result === 'deny') expect(r.reason).toBe('sin reserva');
  });

  it('denies with "fuera de ventana" when scan is too late', () => {
    const now = new Date(`${today}T08:30:00`);
    const r = evaluateGymScan(state, 'u-ana', AREA_GIMNASIO, now);
    expect(r.result).toBe('deny');
    if (r.result === 'deny') expect(r.reason).toBe('fuera de ventana');
  });

  it('denies with "membresía expirada" when reservation exists but membership lapsed', () => {
    const lapsed = {
      ...state,
      users: state.users.map(u =>
        u.id === 'u-maria'
          ? { ...u, membership: { area: AREA_GIMNASIO, validUntil: '2020-01-01' } }
          : u
      ),
    };
    const now = new Date(`${today}T12:00:00`);
    const r = evaluateGymScan(lapsed, 'u-maria', AREA_GIMNASIO, now);
    expect(r.result).toBe('deny');
    if (r.result === 'deny') expect(r.reason).toBe('membresía expirada');
  });
});

describe('evaluateDropInScan', () => {
  it('admits any seeded category during open hours', () => {
    const now = new Date(`${today}T10:00:00`);
    for (const u of state.users) {
      expect(evaluateDropInScan(state, u.id, AREA_CAFETERIA, now).result).toBe('admit');
    }
  });

  it('denies outside hours with "fuera de horario"', () => {
    const now = new Date(`${today}T22:00:00`);
    const r = evaluateDropInScan(state, 'u-juan', AREA_CAFETERIA, now);
    expect(r.result).toBe('deny');
    if (r.result === 'deny') expect(r.reason).toBe('fuera de horario');
  });
});
```

- [ ] **Step 2: Run failing test**

```bash
npm test -- tests/scan.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Write `src/domain/scan.ts`**

```ts
import type { AppState, AreaId, ScanResult, UserId } from './types';
import { canReserveGym, canEnterDropIn } from './eligibility';
import { minutesBetween } from './time';

const SCAN_WINDOW_MIN = 10;

export function evaluateGymScan(state: AppState, userId: UserId, areaId: AreaId, now: Date): ScanResult {
  const user = state.users.find(u => u.id === userId);
  const area = state.areas.find(a => a.id === areaId);
  if (!user || !area) return { result: 'deny', reason: 'sin reserva' };

  const reservation = state.reservations.find(r =>
    r.userId === userId &&
    r.areaId === areaId &&
    r.status === 'active' &&
    Math.abs(minutesBetween(new Date(r.slotStart), now)) <= SCAN_WINDOW_MIN
  );

  if (!reservation) {
    const anyReservationToday = state.reservations.some(r =>
      r.userId === userId && r.areaId === areaId && r.status === 'active' &&
      r.slotStart.slice(0, 10) === now.toISOString().slice(0, 10)
    );
    if (anyReservationToday) return { result: 'deny', reason: 'fuera de ventana' };
    return { result: 'deny', reason: 'sin reserva' };
  }

  const eligibility = canReserveGym(user, area, now);
  if (!eligibility.ok) return { result: 'deny', reason: eligibility.reason };

  return { result: 'admit' };
}

export function evaluateDropInScan(state: AppState, userId: UserId, areaId: AreaId, now: Date): ScanResult {
  const user = state.users.find(u => u.id === userId);
  const area = state.areas.find(a => a.id === areaId);
  if (!user || !area) return { result: 'deny', reason: 'categoría no admitida' };

  const eligibility = canEnterDropIn(user, area, now);
  if (!eligibility.ok) return { result: 'deny', reason: eligibility.reason };
  return { result: 'admit' };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/scan.test.ts
```

Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add tests/scan.test.ts src/domain/scan.ts
git commit -m "feat(seder): scan evaluation for gym (with reservation window) and drop-in"
```

---

## Task 7: Reservation lifecycle

**Files:**
- Create: `src/domain/reservations.ts`, `tests/reservations.test.ts`

- [ ] **Step 1: Write `tests/reservations.test.ts` (failing)**

```ts
import { describe, it, expect } from 'vitest';
import {
  createReservation,
  cancelReservation,
  advanceNoShows,
} from '../src/domain/reservations';
import { buildSeed, AREA_GIMNASIO } from '../src/domain/seed';

const today = '2026-05-30';
const baseNow = new Date(`${today}T07:00:00`);

describe('createReservation', () => {
  it('rejects when slot is full (capacity 8)', () => {
    const state = buildSeed(baseNow);
    const slot = `${today}T15:00:00`;
    // fill 8 slots
    let s = state;
    for (let i = 0; i < 8; i++) {
      const r = createReservation(s, 'u-ana', AREA_GIMNASIO, slot, baseNow);
      if (!r.ok) throw new Error('should have admitted');
      s = r.state;
    }
    const ninth = createReservation(s, 'u-maria', AREA_GIMNASIO, slot, baseNow);
    expect(ninth.ok).toBe(false);
    if (!ninth.ok) expect(ninth.error).toBe('slot lleno');
  });

  it('rejects when user is not eligible (estudiante for gym)', () => {
    const state = buildSeed(baseNow);
    const r = createReservation(state, 'u-juan', AREA_GIMNASIO, `${today}T15:00:00`, baseNow);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('membresía expirada');
  });

  it('rejects for past slots', () => {
    const state = buildSeed(baseNow);
    const past = `${today}T05:00:00`;
    const r = createReservation(state, 'u-ana', AREA_GIMNASIO, past, baseNow);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('slot pasado');
  });

  it('creates reservation when slot has capacity and user is eligible', () => {
    const state = buildSeed(baseNow);
    const r = createReservation(state, 'u-ana', AREA_GIMNASIO, `${today}T15:00:00`, baseNow);
    expect(r.ok).toBe(true);
    if (r.ok) {
      const created = r.state.reservations.find(x => x.slotStart === `${today}T15:00:00` && x.userId === 'u-ana');
      expect(created?.status).toBe('active');
    }
  });
});

describe('cancelReservation', () => {
  it('cancels when more than 1h before slot', () => {
    const state = buildSeed(baseNow);
    const now = new Date(`${today}T16:00:00`);
    const r = cancelReservation(state, 'r-003', now); // r-003 starts 18:00
    expect(r.ok).toBe(true);
    if (r.ok) {
      const cancelled = r.state.reservations.find(x => x.id === 'r-003');
      expect(cancelled?.status).toBe('cancelled');
    }
  });

  it('rejects when within 1h of slot', () => {
    const state = buildSeed(baseNow);
    const now = new Date(`${today}T17:30:00`);
    const r = cancelReservation(state, 'r-003', now);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('fuera de ventana de cancelación');
  });
});

describe('advanceNoShows', () => {
  it('flips active reservations to no-show when > 15min past slot start', () => {
    const state = buildSeed(baseNow);
    const now = new Date(`${today}T08:20:00`); // r-001 starts 08:00, 20min past
    const next = advanceNoShows(state, now);
    const r1 = next.reservations.find(r => r.id === 'r-001')!;
    expect(r1.status).toBe('no-show');
  });

  it('leaves active reservations alone within 15min window', () => {
    const state = buildSeed(baseNow);
    const now = new Date(`${today}T08:10:00`);
    const next = advanceNoShows(state, now);
    expect(next.reservations.find(r => r.id === 'r-001')?.status).toBe('active');
  });
});
```

- [ ] **Step 2: Run failing test**

```bash
npm test -- tests/reservations.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Write `src/domain/reservations.ts`**

```ts
import type { AppState, AreaId, ISODateTime, UserId, Reservation } from './types';
import { canReserveGym } from './eligibility';
import { minutesBetween } from './time';

const CANCEL_WINDOW_MIN = 60;
const NO_SHOW_AFTER_MIN = 15;

export type ActionResult =
  | { ok: true; state: AppState }
  | { ok: false; error: string };

export function createReservation(
  state: AppState,
  userId: UserId,
  areaId: AreaId,
  slotStart: ISODateTime,
  now: Date,
): ActionResult {
  const user = state.users.find(u => u.id === userId);
  const area = state.areas.find(a => a.id === areaId);
  if (!user || !area) return { ok: false, error: 'usuario o área no encontrada' };

  if (new Date(slotStart) < now) {
    return { ok: false, error: 'slot pasado' };
  }

  const eligibility = canReserveGym(user, area, now);
  if (!eligibility.ok) return { ok: false, error: eligibility.reason };

  const occupied = state.reservations.filter(
    r => r.areaId === areaId && r.slotStart === slotStart && r.status === 'active'
  ).length;
  if (occupied >= (area.capacityPerSlot ?? Infinity)) {
    return { ok: false, error: 'slot lleno' };
  }

  const reservation: Reservation = {
    id: `r-${crypto.randomUUID()}`,
    userId,
    areaId,
    slotStart,
    status: 'active',
  };
  return { ok: true, state: { ...state, reservations: [...state.reservations, reservation] } };
}

export function cancelReservation(state: AppState, reservationId: string, now: Date): ActionResult {
  const reservation = state.reservations.find(r => r.id === reservationId);
  if (!reservation) return { ok: false, error: 'reserva no encontrada' };
  if (reservation.status !== 'active') return { ok: false, error: 'reserva no activa' };

  const minutesUntilSlot = minutesBetween(now, new Date(reservation.slotStart));
  if (minutesUntilSlot < CANCEL_WINDOW_MIN) {
    return { ok: false, error: 'fuera de ventana de cancelación' };
  }

  return {
    ok: true,
    state: {
      ...state,
      reservations: state.reservations.map(r =>
        r.id === reservationId ? { ...r, status: 'cancelled' } : r
      ),
    },
  };
}

export function advanceNoShows(state: AppState, now: Date): AppState {
  return {
    ...state,
    reservations: state.reservations.map(r => {
      if (r.status !== 'active') return r;
      const minutesPast = minutesBetween(new Date(r.slotStart), now);
      if (minutesPast > NO_SHOW_AFTER_MIN) return { ...r, status: 'no-show' };
      return r;
    }),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/reservations.test.ts
```

Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add tests/reservations.test.ts src/domain/reservations.ts
git commit -m "feat(seder): reservation lifecycle — create, cancel, no-show transition"
```

---

## Task 8: Zustand store with localStorage persist

**Files:**
- Create: `src/store/index.ts`

- [ ] **Step 1: Write `src/store/index.ts`**

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, UserId, AreaId, ISODateTime, AccessLog, ScanResult } from '../domain/types';
import { buildSeed } from '../domain/seed';
import {
  createReservation as createRes,
  cancelReservation as cancelRes,
  advanceNoShows,
} from '../domain/reservations';
import { evaluateGymScan, evaluateDropInScan } from '../domain/scan';
import { formatISO } from '../domain/time';

type Store = AppState & {
  setActiveUser: (id: UserId) => void;
  setActiveOperator: (name: string) => void;
  reserve: (userId: UserId, areaId: AreaId, slotStart: ISODateTime, now: Date) => string | null;
  cancel: (reservationId: string, now: Date) => string | null;
  scan: (userId: UserId, areaId: AreaId, now: Date) => ScanResult;
  tick: (now: Date) => void;
  resetSeed: () => void;
};

const STORAGE_KEY = 'seder-state-v1';

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...buildSeed(new Date()),

      setActiveUser: (id) => set({ activeUserId: id }),
      setActiveOperator: (name) => set({ activeOperatorName: name }),

      reserve: (userId, areaId, slotStart, now) => {
        const r = createRes(get(), userId, areaId, slotStart, now);
        if (!r.ok) return r.error;
        set(r.state);
        return null;
      },

      cancel: (reservationId, now) => {
        const r = cancelRes(get(), reservationId, now);
        if (!r.ok) return r.error;
        set(r.state);
        return null;
      },

      scan: (userId, areaId, now) => {
        const state = get();
        const area = state.areas.find(a => a.id === areaId)!;
        const result =
          area.archetype === 'slot-bookable'
            ? evaluateGymScan(state, userId, areaId, now)
            : evaluateDropInScan(state, userId, areaId, now);

        const log: AccessLog = {
          id: `l-${crypto.randomUUID()}`,
          ts: formatISO(now),
          userId,
          areaId,
          result: result.result,
          reason: result.result === 'deny' ? result.reason : undefined,
        };
        set({ accessLogs: [log, ...state.accessLogs] });

        if (result.result === 'admit' && area.archetype === 'slot-bookable') {
          const used = state.reservations.find(r =>
            r.userId === userId && r.areaId === areaId && r.status === 'active'
          );
          if (used) {
            set({
              reservations: state.reservations.map(r =>
                r.id === used.id ? { ...r, status: 'used' } : r
              ),
            });
          }
        }

        return result;
      },

      tick: (now) => set(advanceNoShows(get(), now)),

      resetSeed: () => set(buildSeed(new Date())),
    }),
    {
      name: STORAGE_KEY,
      partialize: (s): AppState => ({
        users: s.users,
        areas: s.areas,
        reservations: s.reservations,
        accessLogs: s.accessLogs,
        activeUserId: s.activeUserId,
        activeOperatorName: s.activeOperatorName,
      }),
    },
  ),
);
```

- [ ] **Step 2: Smoke test in dev server**

```bash
npm run dev
```

Open `http://localhost:5173/`. Open devtools console and run:

```js
const s = JSON.parse(localStorage.getItem('seder-state-v1'));
console.log(s.state.users.length, s.state.areas.length, s.state.reservations.length);
```

Expected: `6 2 4` (after a hard reload). Kill dev server.

- [ ] **Step 3: Commit**

```bash
git add src/store/index.ts
git commit -m "feat(seder): zustand store with localStorage persistence and action wiring"
```

---

## Task 9: BroadcastChannel sync

**Files:**
- Create: `src/store/broadcast.ts`
- Modify: `src/store/index.ts` (wire broadcast)

- [ ] **Step 1: Write `src/store/broadcast.ts`**

```ts
import type { AppState } from '../domain/types';

const CHANNEL = 'seder-events';

type SyncMessage = { kind: 'state-update'; state: AppState; origin: string };

export const ORIGIN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function makeChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  return new BroadcastChannel(CHANNEL);
}

export function publish(channel: BroadcastChannel | null, state: AppState): void {
  if (!channel) return;
  const msg: SyncMessage = { kind: 'state-update', state, origin: ORIGIN_ID };
  channel.postMessage(msg);
}

export function subscribe(
  channel: BroadcastChannel | null,
  onState: (state: AppState) => void,
): () => void {
  if (!channel) return () => {};
  const handler = (e: MessageEvent<SyncMessage>) => {
    if (e.data?.kind === 'state-update' && e.data.origin !== ORIGIN_ID) {
      onState(e.data.state);
    }
  };
  channel.addEventListener('message', handler);
  return () => channel.removeEventListener('message', handler);
}
```

- [ ] **Step 2: Wire broadcast in `src/store/index.ts`**

At top of file, after imports, add:

```ts
import { makeChannel, publish, subscribe } from './broadcast';

const channel = makeChannel();
```

Replace each `set(...)` call inside `reserve`, `cancel`, `scan`, `tick`, `resetSeed` with a helper that also publishes. Add this helper after the `create<Store>()(persist(` line, inside the store body — easier: refactor to use `set` followed by `publish(channel, get())`:

```ts
const broadcast = (s: AppState) => publish(channel, s);
```

Actually the cleanest approach: subscribe to store changes once at module load.

Append at the bottom of `src/store/index.ts` (outside `create`):

```ts
useStore.subscribe((state) => {
  publish(channel, {
    users: state.users,
    areas: state.areas,
    reservations: state.reservations,
    accessLogs: state.accessLogs,
    activeUserId: state.activeUserId,
    activeOperatorName: state.activeOperatorName,
  });
});

subscribe(channel, (incoming) => {
  useStore.setState(incoming, false);
});
```

Note: `useStore.subscribe(...)` requires importing `subscribeWithSelector` middleware if you want selective subs; the default `subscribe` fires on every change, which is fine here.

- [ ] **Step 3: Hand-test cross-tab sync**

```bash
npm run dev
```

Open `http://localhost:5173/` in **two tabs**. In tab 1 console:

```js
useStore.getState().setActiveUser('u-juan');
```

(You'll need to expose `useStore` for the test — temporarily add `(window as any).useStore = useStore;` at end of `src/store/index.ts`, then remove after testing.)

In tab 2 console:

```js
useStore.getState().activeUserId
```

Expected: `'u-juan'`. Remove the `(window as any)` exposure. Kill dev server.

- [ ] **Step 4: Commit**

```bash
git add src/store/broadcast.ts src/store/index.ts
git commit -m "feat(seder): BroadcastChannel sync across tabs / PWAs"
```

---

## Task 10: PWA manifests + icons

**Files:**
- Create: `public/cliente.webmanifest`, `public/admin.webmanifest`, `public/icon-cliente-512.png`, `public/icon-cliente-192.png`, `public/icon-admin-512.png`, `public/icon-admin-192.png`

- [ ] **Step 1: Write `public/cliente.webmanifest`**

```json
{
  "name": "SEDER · Cliente",
  "short_name": "SEDER",
  "start_url": "/index.html",
  "scope": "/",
  "display": "standalone",
  "background_color": "#f8fafc",
  "theme_color": "#0f766e",
  "icons": [
    { "src": "/icon-cliente-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-cliente-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 2: Write `public/admin.webmanifest`**

```json
{
  "name": "SEDER · Admin",
  "short_name": "SEDER Admin",
  "start_url": "/admin.html",
  "scope": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#9333ea",
  "icons": [
    { "src": "/icon-admin-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-admin-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 3: Generate placeholder icons**

Use ImageMagick (`brew install imagemagick` / `apt install imagemagick`) or any solid-color PNG. From `repos/seder/`:

```bash
mkdir -p public
convert -size 512x512 xc:'#0f766e' -gravity center -fill white -pointsize 200 -annotate +0+0 'C' public/icon-cliente-512.png
convert -size 192x192 xc:'#0f766e' -gravity center -fill white -pointsize 80 -annotate +0+0 'C' public/icon-cliente-192.png
convert -size 512x512 xc:'#9333ea' -gravity center -fill white -pointsize 200 -annotate +0+0 'A' public/icon-admin-512.png
convert -size 192x192 xc:'#9333ea' -gravity center -fill white -pointsize 80 -annotate +0+0 'A' public/icon-admin-192.png
```

If `convert` is unavailable, create any 512x512 + 192x192 PNGs with the right names (the demo doesn't need polished icons).

- [ ] **Step 4: Verify manifest in browser**

```bash
npm run dev
```

Open `http://localhost:5173/` → DevTools → Application → Manifest. Verify name "SEDER · Cliente", color teal. Open `http://localhost:5173/admin.html` → verify "SEDER · Admin", color purple. Kill dev server.

- [ ] **Step 5: Commit**

```bash
git add public/
git commit -m "feat(seder): PWA manifests + placeholder icons for cliente and admin"
```

---

## Task 11: Routing and shells

**Files:**
- Modify: `src/ClienteApp.tsx`, `src/AdminApp.tsx`
- Create: `src/ui/shells/ClienteShell.tsx`, `src/ui/shells/AdminShell.tsx`

- [ ] **Step 1: Replace `src/ClienteApp.tsx`**

```tsx
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClienteShell from './ui/shells/ClienteShell';
import SelectUser from './ui/cliente/SelectUser';

export default function ClienteApp() {
  return (
    <HashRouter>
      <ClienteShell>
        <Routes>
          <Route path="/" element={<SelectUser />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ClienteShell>
    </HashRouter>
  );
}
```

- [ ] **Step 2: Replace `src/AdminApp.tsx`**

```tsx
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminShell from './ui/shells/AdminShell';
import SelectOperator from './ui/admin/SelectOperator';

export default function AdminApp() {
  return (
    <HashRouter>
      <AdminShell>
        <Routes>
          <Route path="/" element={<SelectOperator />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminShell>
    </HashRouter>
  );
}
```

- [ ] **Step 3: Write `src/ui/shells/ClienteShell.tsx`**

```tsx
import type { ReactNode } from 'react';
import { useStore } from '../../store';

export default function ClienteShell({ children }: { children: ReactNode }) {
  const activeUserId = useStore(s => s.activeUserId);
  const users = useStore(s => s.users);
  const activeUser = users.find(u => u.id === activeUserId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-teal-700 text-white px-4 py-3 flex justify-between items-center">
        <span className="font-bold">SEDER · Cliente</span>
        <span className="text-sm opacity-80">{activeUser ? activeUser.name : 'Sin sesión'}</span>
      </header>
      <main className="p-4 max-w-md mx-auto">{children}</main>
    </div>
  );
}
```

- [ ] **Step 4: Write `src/ui/shells/AdminShell.tsx`**

```tsx
import type { ReactNode } from 'react';
import { useStore } from '../../store';

export default function AdminShell({ children }: { children: ReactNode }) {
  const op = useStore(s => s.activeOperatorName);
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="bg-purple-700 px-4 py-3 flex justify-between items-center">
        <span className="font-bold">SEDER · Admin</span>
        <span className="text-sm opacity-80">{op ?? 'Sin operador'}</span>
      </header>
      <main className="p-4 max-w-3xl mx-auto">{children}</main>
    </div>
  );
}
```

- [ ] **Step 5: Create placeholder `SelectUser.tsx` and `SelectOperator.tsx` (real content in Task 12+17)**

`src/ui/cliente/SelectUser.tsx`:

```tsx
export default function SelectUser() {
  return <p>Selector de usuario — pendiente.</p>;
}
```

`src/ui/admin/SelectOperator.tsx`:

```tsx
export default function SelectOperator() {
  return <p>Selector de operador — pendiente.</p>;
}
```

- [ ] **Step 6: Smoke test**

```bash
npm run dev
```

Verify both routes render with their colored shells and "pendiente" placeholders. Kill dev server.

- [ ] **Step 7: Commit**

```bash
git add src/ClienteApp.tsx src/AdminApp.tsx src/ui/
git commit -m "feat(seder): routing with HashRouter and colored shells for both PWAs"
```

---

## Task 12: Cliente — Selector de usuario

**Files:**
- Modify: `src/ui/cliente/SelectUser.tsx`
- Modify: `src/ClienteApp.tsx` (add Home route)
- Create: `src/ui/cliente/Home.tsx` (placeholder so the navigation target exists)

- [ ] **Step 1: Replace `src/ui/cliente/SelectUser.tsx`**

```tsx
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

export default function SelectUser() {
  const users = useStore(s => s.users);
  const setActiveUser = useStore(s => s.setActiveUser);
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">¿Quién eres?</h2>
      <p className="text-sm text-slate-500">Login simulado para el demo.</p>
      <ul className="space-y-2">
        {users.map(u => (
          <li key={u.id}>
            <button
              type="button"
              onClick={() => { setActiveUser(u.id); navigate('/home'); }}
              className="w-full text-left bg-white border border-slate-200 rounded-lg px-4 py-3 hover:bg-teal-50"
            >
              <div className="font-medium">{u.name}</div>
              <div className="text-xs text-slate-500 capitalize">{u.category}</div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/ui/cliente/Home.tsx` (placeholder)**

```tsx
import { useStore } from '../../store';

export default function Home() {
  const activeUserId = useStore(s => s.activeUserId);
  const user = useStore(s => s.users.find(u => u.id === activeUserId));
  return (
    <div>
      <h2 className="text-xl font-bold">Hola, {user?.name ?? 'invitado'}.</h2>
      <p className="text-sm text-slate-500">Home — pendiente.</p>
    </div>
  );
}
```

- [ ] **Step 3: Add Home route to `src/ClienteApp.tsx`**

Replace the `<Routes>` block with:

```tsx
<Routes>
  <Route path="/" element={<SelectUser />} />
  <Route path="/home" element={<Home />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

And add `import Home from './ui/cliente/Home';` at the top.

- [ ] **Step 4: Smoke test**

```bash
npm run dev
```

Open cliente PWA, click a user, verify navigation to `/#/home` and the greeting shows their name. Kill dev server.

- [ ] **Step 5: Commit**

```bash
git add src/ui/cliente/ src/ClienteApp.tsx
git commit -m "feat(seder): cliente selector de usuario + home placeholder"
```

---

## Task 13: Cliente — Home + Area list + Area detail

**Files:**
- Modify: `src/ui/cliente/Home.tsx`
- Create: `src/ui/cliente/AreaDetail.tsx`
- Modify: `src/ClienteApp.tsx` (add `/area/:id` route)

- [ ] **Step 1: Replace `src/ui/cliente/Home.tsx`**

```tsx
import { Link } from 'react-router-dom';
import { useStore } from '../../store';

export default function Home() {
  const activeUserId = useStore(s => s.activeUserId);
  const user = useStore(s => s.users.find(u => u.id === activeUserId));
  const areas = useStore(s => s.areas);
  const myReservations = useStore(s =>
    s.reservations.filter(r => r.userId === activeUserId && r.status === 'active')
  );

  if (!user) return <p>Sin sesión.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Hola, {user.name}.</h2>
        <Link to="/qr" className="text-sm text-teal-700 underline">Mi QR de acceso</Link>
      </div>

      <section>
        <h3 className="font-semibold mb-2">Próximas reservas</h3>
        {myReservations.length === 0 ? (
          <p className="text-sm text-slate-500">Sin reservas activas.</p>
        ) : (
          <ul className="space-y-2">
            {myReservations.map(r => (
              <li key={r.id} className="bg-white border border-slate-200 rounded px-3 py-2 text-sm">
                {r.areaId} — {r.slotStart.slice(11, 16)}
              </li>
            ))}
          </ul>
        )}
        <Link to="/reservations" className="text-sm text-teal-700 underline mt-1 inline-block">Ver todas</Link>
      </section>

      <section>
        <h3 className="font-semibold mb-2">Áreas</h3>
        <ul className="space-y-2">
          {areas.map(a => (
            <li key={a.id}>
              <Link to={`/area/${a.id}`} className="block bg-white border border-slate-200 rounded px-3 py-2 hover:bg-teal-50">
                <div className="font-medium">{a.name}</div>
                <div className="text-xs text-slate-500">
                  {a.archetype === 'slot-bookable' ? 'Reservar turno' : 'Acceso libre'} · {a.schedule.open}–{a.schedule.close}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/ui/cliente/AreaDetail.tsx`**

```tsx
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

export default function AreaDetail() {
  const { id } = useParams<{ id: string }>();
  const area = useStore(s => s.areas.find(a => a.id === id));
  const navigate = useNavigate();
  if (!area) return <p>Área desconocida.</p>;

  if (area.archetype === 'drop-in') {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-bold">{area.name}</h2>
        <p>Está abierto, ven. Horario: {area.schedule.open}–{area.schedule.close}.</p>
        <Link to="/qr" className="block bg-teal-700 text-white text-center py-2 rounded">Abrir mi QR</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">{area.name}</h2>
      <p className="text-sm text-slate-500">
        Slots de {area.slotDurationMin} min · {area.schedule.open}–{area.schedule.close} · capacidad {area.capacityPerSlot}
      </p>
      <button
        type="button"
        onClick={() => navigate(`/reserve/${area.id}`)}
        className="block w-full bg-teal-700 text-white text-center py-2 rounded"
      >
        Reservar un turno
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Add route to `src/ClienteApp.tsx`**

Add `import AreaDetail from './ui/cliente/AreaDetail';` and a `<Route path="/area/:id" element={<AreaDetail />} />` line.

- [ ] **Step 4: Smoke test**

```bash
npm run dev
```

Open cliente, login as Ana, verify Home shows her 2 active reservations (08:00, 18:00) and area list. Click gimnasio → see reserve button. Click cafetería → see "abierto, ven". Kill dev server.

- [ ] **Step 5: Commit**

```bash
git add src/ui/cliente/ src/ClienteApp.tsx
git commit -m "feat(seder): cliente home with reservations + area detail screens"
```

---

## Task 14: Cliente — Reservar slot

**Files:**
- Create: `src/ui/cliente/ReserveSlot.tsx`
- Modify: `src/ClienteApp.tsx`

- [ ] **Step 1: Write `src/ui/cliente/ReserveSlot.tsx`**

```tsx
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store';
import { hhmmToMinutes } from '../../domain/time';

function* slotsFor(area: { schedule: { open: string; close: string }; slotDurationMin?: number }, day: string) {
  const open = hhmmToMinutes(area.schedule.open);
  const close = hhmmToMinutes(area.schedule.close);
  const dur = area.slotDurationMin ?? 60;
  for (let m = open; m + dur <= close; m += dur) {
    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    yield `${day}T${hh}:${mm}:00`;
  }
}

export default function ReserveSlot() {
  const { areaId } = useParams<{ areaId: string }>();
  const area = useStore(s => s.areas.find(a => a.id === areaId))!;
  const activeUserId = useStore(s => s.activeUserId)!;
  const reserve = useStore(s => s.reserve);
  const reservations = useStore(s => s.reservations);
  const today = new Date().toISOString().slice(0, 10);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const slots = useMemo(() => Array.from(slotsFor(area, today)), [area, today]);

  const occupied = (slot: string) =>
    reservations.filter(r => r.areaId === area.id && r.slotStart === slot && r.status === 'active').length;

  const onReserve = (slot: string) => {
    const err = reserve(activeUserId, area.id, slot, new Date());
    if (err) setError(err);
    else navigate('/reservations');
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">Reservar — {area.name}</h2>
      <p className="text-sm text-slate-500">Hoy, {today}</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <ul className="grid grid-cols-3 gap-2">
        {slots.map(slot => {
          const occ = occupied(slot);
          const full = occ >= (area.capacityPerSlot ?? Infinity);
          return (
            <li key={slot}>
              <button
                type="button"
                disabled={full}
                onClick={() => onReserve(slot)}
                className={`w-full py-2 rounded text-sm ${full ? 'bg-slate-200 text-slate-400' : 'bg-teal-100 hover:bg-teal-200'}`}
              >
                {slot.slice(11, 16)}<br/>
                <span className="text-xs">{occ}/{area.capacityPerSlot}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Add route**

In `src/ClienteApp.tsx`: add `import ReserveSlot from './ui/cliente/ReserveSlot';` and `<Route path="/reserve/:areaId" element={<ReserveSlot />} />`.

- [ ] **Step 3: Smoke test**

```bash
npm run dev
```

Login as María (has gym membership). Go to gimnasio → reservar. Click an empty slot. Verify navigation to `/reservations` (next task — for now will show "pendiente"). Login as Juan → reservar → verify "membresía expirada" error appears in red. Kill dev server.

- [ ] **Step 4: Commit**

```bash
git add src/ui/cliente/ReserveSlot.tsx src/ClienteApp.tsx
git commit -m "feat(seder): cliente — reservar slot con grid de horarios y errores inline"
```

---

## Task 15: Cliente — Mis reservas

**Files:**
- Create: `src/ui/cliente/MyReservations.tsx`
- Modify: `src/ClienteApp.tsx`

- [ ] **Step 1: Write `src/ui/cliente/MyReservations.tsx`**

```tsx
import { useState } from 'react';
import { useStore } from '../../store';

export default function MyReservations() {
  const activeUserId = useStore(s => s.activeUserId)!;
  const reservations = useStore(s => s.reservations.filter(r => r.userId === activeUserId));
  const areas = useStore(s => s.areas);
  const cancel = useStore(s => s.cancel);
  const [error, setError] = useState<string | null>(null);

  const sorted = [...reservations].sort((a, b) => a.slotStart.localeCompare(b.slotStart));

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">Mis reservas</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {sorted.length === 0 && <p className="text-sm text-slate-500">No tienes reservas.</p>}
      <ul className="space-y-2">
        {sorted.map(r => {
          const area = areas.find(a => a.id === r.areaId);
          return (
            <li key={r.id} className="bg-white border border-slate-200 rounded px-3 py-2 flex justify-between items-center">
              <div>
                <div className="font-medium">{area?.name}</div>
                <div className="text-xs text-slate-500">{r.slotStart.replace('T', ' ').slice(0, 16)} · {r.status}</div>
              </div>
              {r.status === 'active' && (
                <button
                  type="button"
                  onClick={() => {
                    const err = cancel(r.id, new Date());
                    setError(err);
                  }}
                  className="text-xs text-red-600 underline"
                >
                  Cancelar
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Add route**

In `src/ClienteApp.tsx`: add `import MyReservations from './ui/cliente/MyReservations';` and `<Route path="/reservations" element={<MyReservations />} />`.

- [ ] **Step 3: Smoke test**

```bash
npm run dev
```

Login as Ana. Verify her 2 seed reservations show. Cancel one within 1h window → expect error; cancel one outside window → status flips to "cancelled". Kill dev server.

- [ ] **Step 4: Commit**

```bash
git add src/ui/cliente/MyReservations.tsx src/ClienteApp.tsx
git commit -m "feat(seder): cliente — mis reservas con botón cancelar"
```

---

## Task 16: Cliente — Mi QR

**Files:**
- Create: `src/ui/cliente/MyQR.tsx`
- Modify: `src/ClienteApp.tsx`

- [ ] **Step 1: Write `src/ui/cliente/MyQR.tsx`**

```tsx
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../../store';

export default function MyQR() {
  const activeUserId = useStore(s => s.activeUserId);
  const user = useStore(s => s.users.find(u => u.id === activeUserId));
  if (!user) return <p>Sin sesión.</p>;

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold">Mi acceso</h2>
      <div className="bg-white p-4 rounded shadow">
        <QRCodeSVG value={user.qrToken} size={240} />
      </div>
      <div className="text-center">
        <div className="font-medium text-lg">{user.name}</div>
        <div className="text-xs text-slate-500 capitalize">{user.category}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add route**

In `src/ClienteApp.tsx`: add `import MyQR from './ui/cliente/MyQR';` and `<Route path="/qr" element={<MyQR />} />`.

- [ ] **Step 3: Smoke test**

```bash
npm run dev
```

Login → "Mi QR de acceso" → verify a QR renders below the user's name. Kill dev server.

- [ ] **Step 4: Commit**

```bash
git add src/ui/cliente/MyQR.tsx src/ClienteApp.tsx
git commit -m "feat(seder): cliente — pantalla Mi QR con qrcode.react"
```

---

## Task 17: Admin — Selector de operador + Dashboard

**Files:**
- Modify: `src/ui/admin/SelectOperator.tsx`
- Create: `src/ui/admin/Dashboard.tsx`
- Modify: `src/AdminApp.tsx`

- [ ] **Step 1: Replace `src/ui/admin/SelectOperator.tsx`**

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

const SUGGESTED = ['Suilan', 'Operador 1', 'Operador 2'];

export default function SelectOperator() {
  const setActiveOperator = useStore(s => s.setActiveOperator);
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const enter = (n: string) => {
    if (!n.trim()) return;
    setActiveOperator(n);
    navigate('/dashboard');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Operador</h2>
      <ul className="space-y-2">
        {SUGGESTED.map(s => (
          <li key={s}>
            <button
              type="button"
              onClick={() => enter(s)}
              className="w-full text-left bg-slate-800 border border-slate-700 rounded px-4 py-3 hover:bg-purple-900"
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Otro nombre"
          className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2"
        />
        <button type="button" onClick={() => enter(name)} className="bg-purple-700 px-4 py-2 rounded">Entrar</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/ui/admin/Dashboard.tsx`**

```tsx
import { Link } from 'react-router-dom';
import { useStore } from '../../store';

export default function Dashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const reservationsToday = useStore(s =>
    s.reservations.filter(r => r.slotStart.startsWith(today) && r.status !== 'cancelled')
  );
  const admitsToday = useStore(s =>
    s.accessLogs.filter(l => l.ts.startsWith(today) && l.result === 'admit')
  );
  const recentLogs = useStore(s => s.accessLogs.slice(0, 10));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Reservas hoy" value={reservationsToday.length} />
        <Stat label="Entradas hoy" value={admitsToday.length} />
        <Stat label="Logs totales" value={useStore(s => s.accessLogs.length)} />
      </div>
      <nav className="flex gap-3 text-sm">
        <Link to="/scanner" className="bg-purple-700 px-3 py-2 rounded">Escáner</Link>
        <Link to="/areas" className="bg-slate-800 px-3 py-2 rounded">Áreas</Link>
        <Link to="/reservations" className="bg-slate-800 px-3 py-2 rounded">Reservas</Link>
        <Link to="/users" className="bg-slate-800 px-3 py-2 rounded">Usuarios</Link>
      </nav>
      <section>
        <h3 className="font-semibold mb-2">Stream reciente</h3>
        {recentLogs.length === 0 ? (
          <p className="text-sm text-slate-500">Sin actividad.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {recentLogs.map(l => (
              <li key={l.id} className={l.result === 'admit' ? 'text-teal-300' : 'text-red-300'}>
                {l.ts.slice(11, 19)} · {l.userId} → {l.areaId} · {l.result}{l.reason ? ` (${l.reason})` : ''}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
```

- [ ] **Step 3: Add Dashboard route**

In `src/AdminApp.tsx`: add `import Dashboard from './ui/admin/Dashboard';` and `<Route path="/dashboard" element={<Dashboard />} />`.

- [ ] **Step 4: Smoke test**

```bash
npm run dev
```

Open admin PWA. Pick "Suilan". Verify Dashboard shows "Reservas hoy: 4" (the seed reservations) and 4 nav links. Kill dev server.

- [ ] **Step 5: Commit**

```bash
git add src/ui/admin/ src/AdminApp.tsx
git commit -m "feat(seder): admin selector de operador + dashboard with counters and event stream"
```

---

## Task 18: Admin — Escáner simulado

**Files:**
- Create: `src/ui/admin/Scanner.tsx`, `src/ui/components/ScanResultBanner.tsx`
- Modify: `src/AdminApp.tsx`

- [ ] **Step 1: Write `src/ui/components/ScanResultBanner.tsx`**

```tsx
import type { ScanResult } from '../../domain/types';

export default function ScanResultBanner({ result, user, area }: {
  result: ScanResult | null;
  user?: { name: string };
  area?: { name: string };
}) {
  if (!result) return null;
  const ok = result.result === 'admit';
  return (
    <div className={`rounded p-4 text-center font-bold ${ok ? 'bg-teal-700' : 'bg-red-700'}`}>
      {ok ? '✅ ADMITIDO' : '❌ DENEGADO'}
      <div className="text-sm font-normal mt-1">
        {user?.name} → {area?.name}
        {!ok && result.result === 'deny' && <> · {result.reason}</>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/ui/admin/Scanner.tsx`**

```tsx
import { useState } from 'react';
import { useStore } from '../../store';
import type { ScanResult } from '../../domain/types';
import ScanResultBanner from '../components/ScanResultBanner';

export default function Scanner() {
  const users = useStore(s => s.users);
  const areas = useStore(s => s.areas);
  const scan = useStore(s => s.scan);
  const [userId, setUserId] = useState(users[0]?.id ?? '');
  const [areaId, setAreaId] = useState(areas[0]?.id ?? '');
  const [result, setResult] = useState<ScanResult | null>(null);

  const onScan = () => setResult(scan(userId, areaId, new Date()));

  const user = users.find(u => u.id === userId);
  const area = areas.find(a => a.id === areaId);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Escáner simulado</h2>
      <ScanResultBanner result={result} user={user} area={area} />
      <div className="grid gap-3">
        <label className="block">
          <span className="text-sm text-slate-400">Usuario</span>
          <select value={userId} onChange={e => setUserId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 mt-1">
            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.category})</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-slate-400">Área</span>
          <select value={areaId} onChange={e => setAreaId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 mt-1">
            {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </label>
        <button type="button" onClick={onScan} className="bg-purple-700 py-3 rounded font-bold">
          Simular escaneo
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add route**

In `src/AdminApp.tsx`: add `import Scanner from './ui/admin/Scanner';` and `<Route path="/scanner" element={<Scanner />} />`.

- [ ] **Step 4: Smoke test**

```bash
npm run dev
```

Open admin Scanner. Pick Ana + Gimnasio → simulate scan. If "now" is within ±10min of one of Ana's seed slots (08:00, 18:00), expect ADMITIDO. Otherwise expect "fuera de ventana" or "sin reserva". Pick Juan + Cafetería → ADMITIDO. Pick Juan + Gimnasio → DENEGADO (membresía expirada). Open Dashboard, verify the scans appear in the live stream. Kill dev server.

- [ ] **Step 5: Commit**

```bash
git add src/ui/admin/Scanner.tsx src/ui/components/ScanResultBanner.tsx src/AdminApp.tsx
git commit -m "feat(seder): admin — escáner simulado con banner admit/deny y log automático"
```

---

## Task 19: Admin — Áreas list

**Files:**
- Create: `src/ui/admin/Areas.tsx`
- Modify: `src/AdminApp.tsx`

- [ ] **Step 1: Write `src/ui/admin/Areas.tsx`**

```tsx
import { useStore } from '../../store';
import { isWithinSchedule } from '../../domain/time';

export default function Areas() {
  const areas = useStore(s => s.areas);
  const now = new Date();

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">Áreas</h2>
      <ul className="space-y-2">
        {areas.map(a => {
          const open = isWithinSchedule(now, a.schedule);
          return (
            <li key={a.id} className="bg-slate-800 border border-slate-700 rounded p-3">
              <div className="flex justify-between">
                <span className="font-medium">{a.name}</span>
                <span className={`text-xs ${open ? 'text-teal-300' : 'text-slate-500'}`}>
                  {open ? 'ABIERTO' : 'CERRADO'}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {a.archetype} · {a.schedule.open}–{a.schedule.close}
                {a.archetype === 'slot-bookable' && <> · cap {a.capacityPerSlot}/slot</>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Add route**

In `src/AdminApp.tsx`: add `import Areas from './ui/admin/Areas';` and `<Route path="/areas" element={<Areas />} />`.

- [ ] **Step 3: Commit**

```bash
git add src/ui/admin/Areas.tsx src/AdminApp.tsx
git commit -m "feat(seder): admin — areas list with open/closed status"
```

---

## Task 20: Admin — Reservas table

**Files:**
- Create: `src/ui/admin/Reservations.tsx`
- Modify: `src/AdminApp.tsx`

- [ ] **Step 1: Write `src/ui/admin/Reservations.tsx`**

```tsx
import { useState } from 'react';
import { useStore } from '../../store';

export default function Reservations() {
  const reservations = useStore(s => s.reservations);
  const users = useStore(s => s.users);
  const areas = useStore(s => s.areas);
  const cancel = useStore(s => s.cancel);
  const [err, setErr] = useState<string | null>(null);

  const sorted = [...reservations].sort((a, b) => a.slotStart.localeCompare(b.slotStart));
  const userName = (id: string) => users.find(u => u.id === id)?.name ?? id;
  const areaName = (id: string) => areas.find(a => a.id === id)?.name ?? id;

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">Reservas</h2>
      {err && <p className="text-sm text-red-300">{err}</p>}
      <table className="w-full text-sm">
        <thead className="text-left text-slate-400 border-b border-slate-700">
          <tr><th>Cuándo</th><th>Quién</th><th>Dónde</th><th>Estado</th><th></th></tr>
        </thead>
        <tbody>
          {sorted.map(r => (
            <tr key={r.id} className="border-b border-slate-800">
              <td className="py-2">{r.slotStart.replace('T', ' ').slice(0, 16)}</td>
              <td>{userName(r.userId)}</td>
              <td>{areaName(r.areaId)}</td>
              <td>{r.status}</td>
              <td>
                {r.status === 'active' && (
                  <button
                    type="button"
                    onClick={() => setErr(cancel(r.id, new Date()))}
                    className="text-red-300 underline"
                  >
                    Cancelar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Add route**

In `src/AdminApp.tsx`: add `import Reservations from './ui/admin/Reservations';` and `<Route path="/reservations" element={<Reservations />} />`.

- [ ] **Step 3: Commit**

```bash
git add src/ui/admin/Reservations.tsx src/AdminApp.tsx
git commit -m "feat(seder): admin — reservas table with cancel action"
```

---

## Task 21: Admin — Usuarios padrón

**Files:**
- Create: `src/ui/admin/Users.tsx`
- Modify: `src/AdminApp.tsx`

- [ ] **Step 1: Write `src/ui/admin/Users.tsx`**

```tsx
import { useStore } from '../../store';

export default function Users() {
  const users = useStore(s => s.users);
  const logs = useStore(s => s.accessLogs);

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">Usuarios</h2>
      <ul className="space-y-3">
        {users.map(u => {
          const userLogs = logs.filter(l => l.userId === u.id).slice(0, 5);
          return (
            <li key={u.id} className="bg-slate-800 border border-slate-700 rounded p-3">
              <div className="flex justify-between">
                <span className="font-medium">{u.name}</span>
                <span className="text-xs text-slate-400 capitalize">{u.category}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Membresía: {u.membership ? `${u.membership.area} hasta ${u.membership.validUntil}` : '—'}
              </div>
              {userLogs.length > 0 && (
                <ul className="mt-2 text-xs space-y-0.5">
                  {userLogs.map(l => (
                    <li key={l.id} className={l.result === 'admit' ? 'text-teal-300' : 'text-red-300'}>
                      {l.ts.slice(11, 19)} → {l.areaId} · {l.result}{l.reason ? ` (${l.reason})` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Add route**

In `src/AdminApp.tsx`: add `import Users from './ui/admin/Users';` and `<Route path="/users" element={<Users />} />`.

- [ ] **Step 3: Commit**

```bash
git add src/ui/admin/Users.tsx src/AdminApp.tsx
git commit -m "feat(seder): admin — usuarios padrón with last 5 access logs per user"
```

---

## Task 22: Reset seed button

**Files:**
- Create: `src/ui/components/ResetSeedButton.tsx`
- Modify: `src/ui/shells/AdminShell.tsx`

- [ ] **Step 1: Write `src/ui/components/ResetSeedButton.tsx`**

```tsx
import { useStore } from '../../store';

export default function ResetSeedButton() {
  const resetSeed = useStore(s => s.resetSeed);
  const onClick = () => {
    if (confirm('¿Resetear todo el estado del demo?')) resetSeed();
  };
  return (
    <button type="button" onClick={onClick} className="text-xs text-purple-300 underline">
      🔄 Resetear seed
    </button>
  );
}
```

- [ ] **Step 2: Add to AdminShell**

In `src/ui/shells/AdminShell.tsx`, replace the header content with:

```tsx
import ResetSeedButton from '../components/ResetSeedButton';
// ...
<header className="bg-purple-700 px-4 py-3 flex justify-between items-center">
  <span className="font-bold">SEDER · Admin</span>
  <div className="flex items-center gap-3">
    <ResetSeedButton />
    <span className="text-sm opacity-80">{op ?? 'Sin operador'}</span>
  </div>
</header>
```

- [ ] **Step 3: Smoke test**

Open admin. Make a few scans. Click "🔄 Resetear seed" → confirm → state returns to 4 seed reservations + empty logs. Verify cliente tab (if open) re-syncs via BroadcastChannel.

- [ ] **Step 4: Commit**

```bash
git add src/ui/components/ResetSeedButton.tsx src/ui/shells/AdminShell.tsx
git commit -m "feat(seder): reset seed button in admin shell"
```

---

## Task 23: Landing chooser at root

**Files:**
- Modify: `index.html` (intercept) — OR keep current behavior and add a small visible "Open Admin PWA →" link in ClienteShell footer.

Choose the simpler path: add a discreet link from cliente to admin and vice versa, so a fresh visitor can find both PWAs.

- [ ] **Step 1: Add admin link to `ClienteShell.tsx` footer**

Add at the end of the `<main>...</main>` in `src/ui/shells/ClienteShell.tsx`:

```tsx
<footer className="mt-12 text-center text-xs text-slate-400">
  <a href="/admin.html" className="underline">Abrir admin PWA →</a>
</footer>
```

- [ ] **Step 2: Add cliente link to `AdminShell.tsx` footer**

Add at the end of `<main>...</main>` in `src/ui/shells/AdminShell.tsx`:

```tsx
<footer className="mt-12 text-center text-xs text-slate-500">
  <a href="/index.html" className="underline">Abrir cliente PWA →</a>
</footer>
```

- [ ] **Step 3: Commit**

```bash
git add src/ui/shells/
git commit -m "feat(seder): cross-PWA discovery links in shells"
```

---

## Task 24: README expanded

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace `README.md`**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs(seder): README with run + demo recipe + test instructions"
```

---

## Task 25: GitHub Pages deployment

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `vite.config.ts` (set `base` for Pages sub-path)

- [ ] **Step 1: Update `vite.config.ts` `base`**

When deployed at `apiad.github.io/seder/`, `base` must be `/seder/`. Change:

```ts
base: './',
```

to:

```ts
base: process.env.GITHUB_ACTIONS ? '/seder/' : '/',
```

This keeps dev at `/` and uses `/seder/` only in CI builds.

- [ ] **Step 2: Write `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Push to GitHub**

Repo doesn't exist on GitHub yet. Create it and push:

```bash
gh repo create apiad/seder --public --source=. --remote=origin --push
```

Then enable Pages: GitHub → Settings → Pages → Source: "GitHub Actions". The workflow will run on the next push.

- [ ] **Step 4: Verify deployment**

After the workflow completes (~1–2 min), open `https://apiad.github.io/seder/` (cliente) and `https://apiad.github.io/seder/admin.html` (admin). Verify both load.

- [ ] **Step 5: Commit and push**

```bash
git add .github/ vite.config.ts
git commit -m "chore(seder): GitHub Pages deployment via workflow on push to main"
git push
```

---

## Task 26: Final smoke + handoff to Suilan

**Files:** none (manual verification + message to Suilan).

- [ ] **Step 1: Reset seed + walk the demo recipe end-to-end on the deployed URL.**

Steps 1–6 from the README "Demo recipe" section. Confirm no console errors. Confirm BroadcastChannel sync works across two browser tabs.

- [ ] **Step 2: Update `vault/Efforts/Projects/App SEDER.md`**

Append a "Despliegue" section linking to the production URL, the repo, and the GitHub Pages workflow. Change `status: scoping` → `status: prototype`.

- [ ] **Step 3: Compose the handoff message**

Plain text for WhatsApp to Suilan, ~5 lines:

> Listo el prototipo del SEDER. Dos URLs:
> - Cliente: https://apiad.github.io/seder/
> - Admin:   https://apiad.github.io/seder/admin.html
>
> Instálalas como apps desde Chrome (menú → "Añadir a pantalla de inicio"). El estado vive en tu navegador — pueden hacer y deshacer todo lo que quieran, no hay servidor. Hay un botón "Resetear seed" en el admin para empezar de cero. Cuéntame qué les falta o qué cambiarías.

No commit needed for this task — it's a manual handoff.

---

## Self-Review

**Spec coverage:**

| Spec section | Covered by |
| ---- | ---- |
| Architecture (Vite/React/TS/Tailwind, two HTML entries, zustand+localStorage, BroadcastChannel) | Tasks 1, 8, 9 |
| Data model (types + seed) | Tasks 2, 4 |
| Gym archetype rules (slot, capacity 8, ±10min window, 15min no-show, 1h cancel) | Tasks 5, 6, 7 |
| Cafeteria archetype rules (drop-in, schedule, allowedCategories) | Tasks 5, 6 |
| Cliente screens (6) | Tasks 12, 13, 14, 15, 16 |
| Admin screens (6) | Tasks 17, 18, 19, 20, 21 |
| Reset seed | Task 22 |
| PWA manifests | Task 10 |
| Deployment (GitHub Pages) | Task 25 |
| Conventions (Spanish UI / English identifiers, main branch, vitest only for domain) | Plan header + each task body |

No gaps spotted.

**Placeholder scan:** No "TBD", "implement later", or hand-wavy steps. The "convert" command in Task 10 Step 3 has an explicit fallback ("any 512x512 + 192x192 PNGs with the right names"). The Task 23 "OR" phrasing picks one option immediately — not a placeholder.

**Type consistency:** `Eligibility` discriminated union with `ok: true | false` is used consistently. `ScanResult` discriminated union with `result: 'admit' | 'deny'` is used consistently. `ActionResult` for store actions returns `error: string` (not a typed enum) because the layer is presentational — that's fine. `AREA_GIMNASIO` / `AREA_CAFETERIA` constants are referenced by the same name across seed.ts, tests, and the implicit checks.

One thing to flag for the executor: the BroadcastChannel sync (Task 9) uses `useStore.setState(incoming, false)` which **does not** trigger the `persist` middleware's write. That's intentional (avoids a write loop). The active tab's writes go through `set()` which persists; the passive tab updates state without re-persisting. If you observe loops or stale localStorage, this is the place to look.
