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
