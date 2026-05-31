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
