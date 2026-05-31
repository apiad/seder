import { describe, it, expect } from 'vitest';
import { evaluateGymScan, evaluateDropInScan } from '../src/domain/scan';
import { buildSeed, AREA_GIMNASIO, AREA_CAFETERIA } from '../src/domain/seed';

const today = '2026-05-30';
const seedNow = new Date(`${today}T07:30:00`);
const state = buildSeed(seedNow);

describe('evaluateGymScan', () => {
  it('admits when active reservation exists within ±10min of slot start', () => {
    const now = new Date(`${today}T08:05:00`);
    const r = evaluateGymScan(state, 'u-ana', AREA_GIMNASIO, now);
    expect(r.result).toBe('admit');
  });

  it('admits when scanning exactly at slot start', () => {
    const now = new Date(`${today}T08:00:00`);
    expect(evaluateGymScan(state, 'u-ana', AREA_GIMNASIO, now).result).toBe('admit');
  });

  it('denies with "sin reserva" when user has no reservation', () => {
    const now = new Date(`${today}T08:05:00`);
    const r = evaluateGymScan(state, 'u-juan', AREA_GIMNASIO, now);
    expect(r.result).toBe('deny');
    if (r.result === 'deny') expect(r.reason).toBe('sin reserva');
  });

  it('denies with "fuera de ventana" when scan is too late', () => {
    const now = new Date(`${today}T08:30:00`);
    const r = evaluateGymScan(state, 'u-ana', AREA_GIMNASIO, now);
    expect(r.result).toBe('deny');
    if (r.result === 'deny') expect(r.reason).toBe('fuera de ventana');
  });

  it('denies with "membresía expirada" when reservation exists but membership lapsed', () => {
    const lapsed = {
      ...state,
      users: state.users.map(u =>
        u.id === 'u-maria'
          ? { ...u, membership: { area: AREA_GIMNASIO, validUntil: '2020-01-01' } }
          : u
      ),
    };
    const now = new Date(`${today}T12:00:00`);
    const r = evaluateGymScan(lapsed, 'u-maria', AREA_GIMNASIO, now);
    expect(r.result).toBe('deny');
    if (r.result === 'deny') expect(r.reason).toBe('membresía expirada');
  });
});

describe('evaluateDropInScan', () => {
  it('admits any seeded category during open hours', () => {
    const now = new Date(`${today}T10:00:00`);
    for (const u of state.users) {
      expect(evaluateDropInScan(state, u.id, AREA_CAFETERIA, now).result).toBe('admit');
    }
  });

  it('denies outside hours with "fuera de horario"', () => {
    const now = new Date(`${today}T22:00:00`);
    const r = evaluateDropInScan(state, 'u-juan', AREA_CAFETERIA, now);
    expect(r.result).toBe('deny');
    if (r.result === 'deny') expect(r.reason).toBe('fuera de horario');
  });
});
