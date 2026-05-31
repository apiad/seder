# AGENTS.md — seder

You're an AI agent picking up the **SEDER** prototype — the access-control
+ reservations app for the UH stadium. This file is the door.

## What it is

A discovery artifact, not production code. Two PWAs shipped from a single
Vite bundle, no backend, all state in `localStorage` under
`seder-state-v1` and synced across tabs/PWAs via `BroadcastChannel`.
Real surfaces with real flows so UH stakeholders can play with concrete
screens and discover what the real system needs to be.

Live demo: <https://apiad.github.io/seder/> (cliente) ·
<https://apiad.github.io/seder/admin.html> (admin).

## Stack

- Vite + React 19 + TypeScript + Tailwind 4 (`@theme` in `src/index.css`)
- Zustand with `persist` middleware + a `BroadcastChannel` bridge in
  `src/store/`
- React Router `HashRouter` (project lives under `/seder/` on GH Pages
  so we avoid clean URLs)
- Vitest for the domain logic; screens validated by hand (the
  `saidkick` skill drives the real Chrome for end-to-end checks)
- Deploy: `.github/workflows/deploy.yml` builds + tests + publishes to
  GitHub Pages on every push to `main`

## Layout

    index.html, admin.html         dual Vite entry points (cliente / admin)
    src/
      main-cliente.tsx, ClienteApp.tsx        cliente PWA root + router
      main-admin.tsx, AdminApp.tsx            admin PWA root + router
      domain/                                 pure logic (time, seed,
                                              eligibility, scan,
                                              reservations) + types
      store/                                  zustand store + broadcast
      ui/
        shells/   ClienteShell, AdminShell    headers + route transition
        cliente/  SelectUser, Home, AreaDetail, ReserveSlot,
                  MyReservations, MyQR
        admin/    SelectOperator, Dashboard, Scanner, Areas,
                  Reservations, Users
        components/   ScanResultBanner, ResetSeedButton
    public/                                   manifests + icons
    tests/                                    vitest suites for domain/
    docs/superpowers/                         spec + plan from bootstrap

## Conventions

- **Ships to `main` directly** — no PR cycle, no feature branches.
- **Visual identity is UH** — granate `#6d222e`, beige `#d6c499`,
  Cinzel + Jost. See `know-how/visual-identity-uh.md` before adding any
  surface.
- **Cliente vs admin** is the only split that matters: cliente = public
  (white + cream + granate), admin = operator (granate-darker + beige
  accents). Don't introduce a third palette.
- **No `useStore(s => s.X.filter(...))`** ever. See
  `know-how/zustand-store-patterns.md`.
- **Hard-coded `/foo.html` is a bug.** Anything that becomes an absolute
  URL at runtime must route through `import.meta.env.BASE_URL`. See
  `know-how/github-pages-base-path.md`.
- **Domain logic stays in `src/domain/`** with vitest coverage. UI
  components consume the store; they don't reimplement eligibility,
  windows, or capacity.

## Local dev

    npm install
    npm run dev      # vite, http://localhost:5173/  (+ /admin.html)
    npm test         # vitest run
    npm run build    # tsc -b && vite build
    npm run preview  # serve dist/ for a manual prod smoke

Vite config sets `base: '/seder/'` only when `GITHUB_ACTIONS=1`; locally
the base is `/`, so both dev and prod paths get exercised through
`import.meta.env.BASE_URL`.

## Deploy

`git push origin main` triggers `.github/workflows/deploy.yml`. The
workflow runs `npm ci → npm test → npm run build` and publishes `dist/`
via `actions/upload-pages-artifact` + `actions/deploy-pages`.

GitHub Pages must be in **`build_type: workflow`** mode (not the
default `legacy`). If a `Deploy to GitHub Pages` run fails with
`HttpError: Not Found` from `deploy-pages`, that's the cause — flip it
with `gh api -X PUT repos/apiad/seder/pages -f build_type=workflow` and
re-run the workflow.

## know-how/

- **[github-pages-base-path](know-how/github-pages-base-path.md)** —
  reach for it before adding any cross-PWA link, manifest entry, or
  absolute href; production lives under `/seder/`, not root, and every
  absolute path needs the BASE_URL bake.
- **[zustand-store-patterns](know-how/zustand-store-patterns.md)** —
  reach for it before touching `src/store/` or writing any new
  `useStore(...)` selector; documents the infinite-loop selector
  anti-pattern and the BroadcastChannel echo-loop trap.
- **[visual-identity-uh](know-how/visual-identity-uh.md)** — reach for
  it before composing any new screen, button, card, or input; covers
  the palette, the Cinzel/Jost split, the bulky-touch-target defaults,
  and the route-transition pattern.
