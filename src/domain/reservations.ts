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
