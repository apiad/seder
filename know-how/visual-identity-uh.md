# know-how: UH visual identity

*When to reach for it:* you're composing any new screen, button, card,
form input, or banner — or refactoring an existing one. The look
imitates `uh.cu` so the prototype reads as institutional to UH
stakeholders the moment they open it; don't drift from it.

## Palette

Defined in `src/index.css` as a Tailwind 4 `@theme` block. Reference
the named tokens (`uh-granate`, `uh-beige`, etc.) — don't reach for
generic `red-900` / `amber-200` substitutes.

| Token | Hex | Use |
|---|---|---|
| `uh-granate` | `#6d222e` | Institutional primary. Cliente CTAs, headers, accents. |
| `uh-granate-dark` | `#4a1620` | Admin headers, hover state for granate. |
| `uh-granate-darker` | `#2e0d14` | Admin page background. |
| `uh-granate-soft` | `#f5e6e8` | Cliente hover on white cards. |
| `uh-beige` | `#d6c499` | Admin accents, secondary CTAs, "stamp" labels. |
| `uh-beige-dark` | `#b89a5e` | Hover state for beige. |
| `uh-cream` | `#f7f1e3` | Cliente page background, admin foreground text. |

Cliente = bright + institutional (white shell over cream, granate
accents). Admin = dark + operator (granate-darker background, beige
accents). Don't introduce a third palette to differentiate something
new — find a third role inside these two.

## Fonts

Imported from Google Fonts in `src/index.css`:

- **Cinzel** (`font-display`) — display serif, all caps, wide tracking.
  Use for: page titles (`h2`), section labels (small uppercase),
  primary-CTA labels, the `SEDER` wordmark, statistic numbers in
  Dashboard tiles, banner verdicts ("ADMITIDO" / "DENEGADO").
- **Jost** (`font-sans`, the default) — geometric sans for body, form
  controls, secondary labels.

Typical heading pattern:

    <h2 className="font-display text-2xl tracking-wide text-uh-granate">…</h2>

For admin (dark surfaces) swap `text-uh-granate` → `text-uh-beige`
and add `uppercase`:

    <h2 className="font-display text-2xl tracking-widest text-uh-beige uppercase">…</h2>

Section labels are small caps:

    <h3 className="font-display uppercase tracking-widest text-xs text-uh-granate mb-2">…</h3>

## Shells

`ClienteShell` and `AdminShell` already carry the wordmark + the
institutional context strip ("Universidad de La Habana · Estadio
Universitario" / "Panel administrativo"). Don't re-render that header
inside individual screens; just render the screen content.

Both shells wrap their children in a path-keyed `view-enter` div for
the route transition (see "Route transitions" below). Don't break
that — leave the `<div key={location.pathname} className="view-enter">`
in place if you refactor shells.

## Bulky, mobile-friendly defaults

Every tappable thing is sized for a real thumb. Don't ship a control
that's smaller than `min-h-14` (≈56px) for a primary action or
`min-h-10` for a secondary one. Same applies to inputs and selects.

Reusable recipes:

**Big card link / button** (cliente — user picker, area cards):

    bg-white border border-slate-200 rounded-xl px-5 py-4 min-h-16
    shadow-sm hover:bg-uh-granate-soft hover:border-uh-granate
    hover:shadow-md active:scale-[0.98]
    transition-all duration-150

**Primary CTA** (cliente — Abrir QR, Reservar):

    bg-uh-granate text-uh-cream text-center py-4 min-h-14 rounded-xl
    uppercase tracking-widest text-base font-display
    shadow-md hover:bg-uh-granate-dark hover:shadow-lg active:scale-[0.98]
    transition-all duration-150

**Primary CTA** (admin — Entrar, Simular escaneo):

    bg-uh-beige text-uh-granate-dark py-4 min-h-16 rounded-xl text-lg
    font-display uppercase tracking-widest
    shadow-md hover:bg-uh-beige-dark hover:shadow-lg active:scale-[0.98]
    transition-all duration-150

**Dark surface card** (admin — areas, users, stat tiles):

    bg-uh-granate-dark border border-uh-granate rounded-xl px-4 py-4
    shadow-md

**Inverted-state slot button** (reserve grid — outlined → filled on
hover, the "stamp" feel):

    bg-white border-2 border-uh-granate text-uh-granate rounded-xl
    py-3 min-h-16 shadow-sm
    hover:bg-uh-granate hover:text-uh-cream hover:shadow-md
    active:scale-[0.95] transition-all duration-150

Always include `active:scale-[0.95–0.98]` on tappable elements so
mobile gets a real press-feedback. `src/index.css` already disables
the iOS blue tap highlight (`-webkit-tap-highlight-color: transparent`)
so the only feedback is the scale + shadow transition.

## Route transitions

Defined in `src/index.css`:

    @keyframes seder-enter {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .view-enter { animation: seder-enter 240ms cubic-bezier(0.2, 0.7, 0.2, 1); }

Triggered by remounting on `location.pathname` change inside each
shell. A re-render that doesn't change `location.pathname` does *not*
replay the animation (React keeps the node), which is the intent —
form interactions and store updates shouldn't flicker.

If you add a new top-level effect that needs an entrance animation,
prefer composing another short keyframe in `index.css` rather than
pulling in `framer-motion` / `tailwindcss-animate`. Build size matters
(this is a PWA Suilan will load over Cuban mobile data).

## QR

The QR uses the `qrcode.react` `<QRCodeSVG>` with `fgColor="#6d222e"`.
Don't render it on a granate surface (low contrast); the cliente shell
is intentionally white/cream so the QR pops.

## Theme colors

Browser chrome (`<meta name="theme-color">`) and the PWA manifest
(`theme_color`, `background_color`) must match the shell:

- Cliente: `theme_color` granate `#6d222e`, `background_color` cream
  `#f7f1e3`.
- Admin: `theme_color` granate-dark `#4a1620`, `background_color`
  granate-darker `#2e0d14`.

If you tweak shell colors, update both `index.html` / `admin.html` and
`public/cliente.webmanifest` / `public/admin.webmanifest` in the same
commit.
