# know-how: zustand store patterns

*When to reach for it:* you're writing a new `useStore(s => ...)`
selector, touching anything in `src/store/`, or debugging a screen
that renders blank / a noticeable animation flicker on every state
change.

The store is in `src/store/index.ts`: a single `create()` with `persist`
middleware (localStorage key `seder-state-v1`) and a `BroadcastChannel`
bridge so both PWAs (cliente at `/`, admin at `/admin.html`) see each
other's state in real time.

Two pitfalls have bitten us so far. Both are subtle and both render
the app unusable.

## 1. Never derive arrays inside a `useStore` selector

The selector return value goes into `useSyncExternalStore`'s
`getSnapshot`. React calls `getSnapshot` on every render and compares
the result with `Object.is` to decide whether to re-render. If you
return a freshly-built array, the reference is new every time → React
sees a "change" → schedules another render → calls `getSnapshot` again
→ another new array → infinite loop. The component unmounts with
*"Maximum update depth exceeded"* and the screen goes blank.

**Wrong:**

    const myReservations = useStore(s =>
      s.reservations.filter(r => r.userId === activeUserId)
    );
    const recentLogs = useStore(s => s.accessLogs.slice(0, 10));

**Right** — select the raw array, derive in the render body:

    const reservations = useStore(s => s.reservations);
    const myReservations = reservations.filter(r => r.userId === activeUserId);

    const accessLogs = useStore(s => s.accessLogs);
    const recentLogs = accessLogs.slice(0, 10);

Same rule for `.map()`, `.sort()`, `.concat()`, spread (`[...x]`),
`Object.values()`, etc. Anything that returns a fresh reference.

`.find(...)` is safe **if the matched object isn't mutated** — it
returns the same reference each time. Same for `.length`, primitives,
and direct field access (`s.users`, `s.activeUserId`).

When in doubt, grep before merging:

    rg 'useStore\(s\s*=>\s*s\.\w+\.(filter|map|slice|sort|reduce|concat)' src/

## 2. The BroadcastChannel bridge must not echo

`src/store/index.ts` wires two halves:

- `useStore.subscribe(state => publish(channel, …))` — every local
  state change posts to the channel.
- `subscribe(channel, incoming => useStore.setState(incoming, false))`
  — every remote message updates the local store.

`broadcast.ts` already filters same-origin messages (a tab never
consumes its own publish). But `useStore.setState(incoming)` still
fires the local `subscribe` callback — which publishes again. Net
effect with both PWAs open:

    cliente set() → publish → admin setState → admin subscribe →
    publish back → cliente setState → cliente subscribe → publish → …

Infinite ping-pong. Visible symptom: every click triggers hundreds of
re-renders, the route-transition CSS animation appears to "flicker on
a loop", and devtools shows a sustained message storm on the channel.

**Fix in place:** a module-scoped flag suppresses re-publish while
applying a remote message:

    let applyingRemote = false;

    useStore.subscribe(state => {
      if (applyingRemote) return;
      publish(channel, { … });
    });

    subscribe(channel, incoming => {
      applyingRemote = true;
      try { useStore.setState(incoming, false); }
      finally { applyingRemote = false; }
    });

The flag works because zustand's subscribe callbacks fire synchronously
inside `setState`. Don't replace it with `setTimeout` cleanup or an
async pattern — the flag must be cleared before the next user-driven
`set()` runs.

### Verifying the bridge

Open both PWAs in two tabs (cliente + admin), instrument both:

    // in each tab's devtools
    window.__rcount = 0;
    new BroadcastChannel('seder-events')
      .addEventListener('message', () => window.__rcount++);

Trigger one state change (e.g. click a user in cliente). Each tab
should observe exactly **one** message — the publish from the peer.
Anything more is the loop coming back.
