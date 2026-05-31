# know-how: GitHub Pages base path

*When to reach for it:* you're about to write an absolute URL anywhere
in this repo — an `href`, a `start_url`, an icon `src`, a fetch path —
or you're debugging a 404 in production that doesn't reproduce in
`npm run dev`.

## The split

| Environment | Base | An absolute `/foo.html` resolves to |
|---|---|---|
| Local dev (`npm run dev`) | `/` | `http://localhost:5173/foo.html` ✓ |
| Local build (`npm run build`) | `/` | `dist/foo.html` ✓ |
| Production (GH Actions build) | `/seder/` | `https://apiad.github.io/foo.html` ✗ (404) |

The project is served from `apiad.github.io/seder/`, not from a custom
domain root. Anything hardcoded to `/` works in dev and breaks in prod.
The branching lives in `vite.config.ts`:

    base: process.env.GITHUB_ACTIONS ? '/seder/' : '/',

## Rules

### 1. `<link rel="manifest">` and asset links in HTML — Vite handles them

In `index.html` / `admin.html`, write the link as if you were at the
site root:

    <link rel="manifest" href="/cliente.webmanifest" />

Vite rewrites it to `/seder/cliente.webmanifest` at build time. Don't
prepend the base manually; Vite's HTML transform double-rewrites
otherwise.

### 2. Cross-PWA links from React code — use `BASE_URL`

Inside `.tsx`, hardcoded `<a href="/admin.html">` ships as-is into the
bundle and goes to `apiad.github.io/admin.html` (404) in prod. Use
the Vite env:

    <a href={`${import.meta.env.BASE_URL}admin.html`}>Abrir admin</a>
    <a href={import.meta.env.BASE_URL}>Abrir cliente</a>

`BASE_URL` is `/` in dev, `/seder/` in prod — both end with `/`, so
you concatenate the filename without a leading slash.

### 3. PWA manifest internal paths — always relative

The manifest *file* is at `/seder/cliente.webmanifest` (or `/` in dev).
The browser resolves paths inside it against the manifest URL. So:

    {
      "start_url": "./",                      // → /seder/
      "scope":     "./",                      // → /seder/
      "icons": [{ "src": "./icon-cliente-192.png" }]  // → /seder/icon-...
    }

Manifests are static JSON — Vite does NOT substitute `BASE_URL` inside
them. Absolute `/foo.png` would 404. Relative `./foo.png` works in
both dev and prod.

For the admin manifest, narrow `scope` so it wins over the cliente
manifest when both PWAs are installed:

    "scope": "./admin.html"

A more specific matching scope beats a broader one — the browser picks
the admin manifest for `/seder/admin.html` and the cliente manifest
for everything else under `/seder/`.

### 4. React Router — use `HashRouter`, not `BrowserRouter`

We use `HashRouter` precisely so the GitHub Pages base-path quirk
doesn't bleed into client-side routing. `BrowserRouter` would require
either a custom 404 redirect dance or a Pages-aware `basename={import.meta.env.BASE_URL}`, both of which we've avoided. If you find
yourself reaching for `<Link to="/...">`, you're fine: `HashRouter`
prefixes hash routes after whatever path the page lives under.

## Verifying after a change

Build with the prod base and inspect what got baked into the bundle:

    GITHUB_ACTIONS=1 npm run build
    grep -E 'admin\.html|index\.html|seder' dist/assets/cliente-*.js
    grep -E 'admin\.html|index\.html|seder' dist/assets/admin-*.js
    cat dist/cliente.webmanifest dist/admin.webmanifest

Every URL fragment you find should start with `/seder/` (or be
relative). Anything that looks like a bare `/admin.html` or
`/icon-...png` is the bug.

For the live site, hit each entry and assert HTTP 200:

    for path in / admin.html cliente.webmanifest admin.webmanifest \
                icon-cliente-192.png icon-admin-192.png; do
      curl -s -o /dev/null -w "$path: %{http_code}\n" \
        "https://apiad.github.io/seder/$path"
    done
