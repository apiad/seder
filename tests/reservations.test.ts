import { describe, it, expect } from 'vitest';
import {
  createReservation,
  cancelReservation,
  advanceNoShows,
} from '../src/domain/reservations';
import { buildSeed, AREA_GIMNASIO } from '../src/domain/seed';

const today = '2026-05-30';
const baseNow = new Date(`${today}T07:00:00`);

describe('createReservation', () => {
  it('rejects when slot is full (capacity 8)', () => {
    const state = buildSeed(baseNow);
    const slot = `${today}T15:00:00`;
    let s = state;
    for (let i = 0; i < 8; i++) {
      const r = createReservation(s, 'u-ana', AREA_GIMNASIO, slot, baseNow);
      if (!r.ok) throw new Error('should have admitted');
      s = r.state;
    }
    const ninth = createReservation(s, 'u-maria', AREA_GIMNASIO, slot, baseNow);
    expect(ninth.ok).toBe(false);
    if (!ninth.ok) expect(ninth.error).toBe('slot lleno');
  });

  it('rejects when user is not eligible (estudiante for gym)', () => {
    const state = buildSeed(baseNow);
    const r = createReservation(state, 'u-juan', AREA_GIMNASIO, `${today}T15:00:00`, baseNow);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('membresía expirada');
  });

  it('rejects for past slots', () => {
    const state = buildSeed(baseNow);
    const past = `${today}T05:00:00`;
    const r = createReservation(state, 'u-ana', AREA_GIMNASIO, past, baseNow);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('slot pasado');
  });

  it('creates reservation when slot has capacity and user is eligible', () => {
    const state = buildSeed(baseNow);
    const r = createReservation(state, 'u-ana', AREA_GIMNASIO, `${today}T15:00:00`, baseNow);
    expect(r.ok).toBe(true);
    if (r.ok) {
      const created = r.state.reservations.find(x => x.slotStart === `${today}T15:00:00` && x.userId === 'u-ana');
      expect(created?.status).toBe('active');
    }
  });
});

describe('cancelReservation', () => {
  it('cancels when more than 1h before slot', () => {
    const state = buildSeed(baseNow);
    const now = new Date(`${today}T16:00:00`);
    const r = cancelReservation(state, 'r-003', now);
    expect(r.ok).toBe(true);
    if (r.ok) {
      const cancelled = r.state.reservations.find(x => x.id === 'r-003');
      expect(cancelled?.status).toBe('cancelled');
    }
  });

  it('rejects when within 1h of slot', () => {
    const state = buildSeed(baseNow);
    const now = new Date(`${today}T17:30:00`);
    const r = cancelReservation(state, 'r-003', now);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('fuera de ventana de cancelación');
  });
});

describe('advanceNoShows', () => {
  it('flips active reservations to no-show when > 15min past slot start', () => {
    const state = buildSeed(baseNow);
    const now = new Date(`${today}T08:20:00`);
    const next = advanceNoShows(state, now);
    const r1 = next.reservations.find(r => r.id === 'r-001')!;
    expect(r1.status).toBe('no-show');
  });

  it('leaves active reservations alone within 15min window', () => {
    const state = buildSeed(baseNow);
    const now = new Date(`${today}T08:10:00`);
    const next = advanceNoShows(state, now);
    expect(next.reservations.find(r => r.id === 'r-001')?.status).toBe('active');
  });
});
