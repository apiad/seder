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
