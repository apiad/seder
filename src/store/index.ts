import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, UserId, AreaId, ISODateTime, AccessLog, ScanResult } from '../domain/types';
import { makeChannel, publish, subscribe } from './broadcast';

const channel = makeChannel();
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

let applyingRemote = false;

useStore.subscribe((state) => {
  if (applyingRemote) return;
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
  applyingRemote = true;
  try {
    useStore.setState(incoming, false);
  } finally {
    applyingRemote = false;
  }
});
