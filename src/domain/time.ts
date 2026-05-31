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
