import { describe, it, expect } from 'vitest';
import { canReserveGym, canEnterDropIn } from '../src/domain/eligibility';
import { buildSeed, AREA_GIMNASIO, AREA_CAFETERIA } from '../src/domain/seed';

const now = new Date('2026-05-30T10:00:00');
const state = buildSeed(now);
const gym = state.areas.find(a => a.id === AREA_GIMNASIO)!;
const cafe = state.areas.find(a => a.id === AREA_CAFETERIA)!;
const userBy = (name: string) => state.users.find(u => u.name === name)!;

describe('canReserveGym', () => {
  it('admits caribes without membership (free category)', () => {
    expect(canReserveGym(userBy('Ana'), gym, now).ok).toBe(true);
  });
  it('admits comunidad with valid membership', () => {
    expect(canReserveGym(userBy('María'), gym, now).ok).toBe(true);
  });
  it('rejects estudiante without membership', () => {
    const r = canReserveGym(userBy('Juan'), gym, now);
    expect(r.ok).toBe(false);
    expect(r.ok || r.reason).toBe('membresía expirada');
  });
  it('rejects externo without membership', () => {
    expect(canReserveGym(userBy('Pedro'), gym, now).ok).toBe(false);
  });
  it('rejects when membership has expired', () => {
    const expired = { ...userBy('María'), membership: { area: AREA_GIMNASIO, validUntil: '2020-01-01' } };
    const r = canReserveGym(expired, gym, now);
    expect(r.ok).toBe(false);
    expect(r.ok || r.reason).toBe('membresía expirada');
  });
});

describe('canEnterDropIn', () => {
  it('admits any seeded category during open hours', () => {
    for (const u of state.users) {
      expect(canEnterDropIn(u, cafe, new Date('2026-05-30T10:00:00')).ok).toBe(true);
    }
  });
  it('rejects outside hours', () => {
    const r = canEnterDropIn(userBy('Juan'), cafe, new Date('2026-05-30T22:00:00'));
    expect(r.ok).toBe(false);
    expect(r.ok || r.reason).toBe('fuera de horario');
  });
});
