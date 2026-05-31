import { describe, it, expect } from 'vitest';
import { buildSeed, AREA_GIMNASIO, AREA_CAFETERIA } from '../src/domain/seed';

describe('buildSeed', () => {
  const state = buildSeed(new Date('2026-05-30T12:00:00'));

  it('has 6 users with unique categories', () => {
    expect(state.users).toHaveLength(6);
    const cats = state.users.map(u => u.category);
    expect(new Set(cats).size).toBe(6);
  });

  it('has 2 areas: gym (slot-bookable) and cafeteria (drop-in)', () => {
    expect(state.areas).toHaveLength(2);
    const gym = state.areas.find(a => a.id === AREA_GIMNASIO)!;
    expect(gym.archetype).toBe('slot-bookable');
    expect(gym.capacityPerSlot).toBe(8);
    expect(gym.slotDurationMin).toBe(60);
    expect(gym.requiresMembership).toBe(true);
    expect(gym.freeCategories).toEqual(['caribes']);
    expect(gym.schedule).toEqual({ open: '06:00', close: '22:00' });

    const cafe = state.areas.find(a => a.id === AREA_CAFETERIA)!;
    expect(cafe.archetype).toBe('drop-in');
    expect(cafe.allowedCategories).toContain('estudiante');
    expect(cafe.allowedCategories).toContain('externo');
    expect(cafe.schedule).toEqual({ open: '07:00', close: '21:00' });
  });

  it('has María (comunidad) with valid gym membership', () => {
    const maria = state.users.find(u => u.name === 'María')!;
    expect(maria.category).toBe('comunidad');
    expect(maria.membership).toBeDefined();
    expect(maria.membership!.area).toBe(AREA_GIMNASIO);
  });

  it('has Ana (caribes) without explicit membership', () => {
    const ana = state.users.find(u => u.name === 'Ana')!;
    expect(ana.category).toBe('caribes');
    expect(ana.membership).toBeUndefined();
  });

  it('has 4 pre-populated reservations spread across today', () => {
    expect(state.reservations).toHaveLength(4);
    state.reservations.forEach(r => {
      expect(r.areaId).toBe(AREA_GIMNASIO);
      expect(r.status).toBe('active');
    });
  });

  it('starts with empty access logs', () => {
    expect(state.accessLogs).toEqual([]);
  });
});
