import { describe, it, expect } from 'vitest';
import { hhmmToMinutes, isWithinSchedule, minutesBetween, slotEnclosing } from '../src/domain/time';

describe('hhmmToMinutes', () => {
  it('parses HH:mm', () => {
    expect(hhmmToMinutes('06:00')).toBe(360);
    expect(hhmmToMinutes('22:30')).toBe(1350);
  });
});

describe('isWithinSchedule', () => {
  it('returns true at open boundary', () => {
    expect(isWithinSchedule(new Date('2026-05-30T07:00:00'), { open: '07:00', close: '21:00' })).toBe(true);
  });
  it('returns false at close boundary', () => {
    expect(isWithinSchedule(new Date('2026-05-30T21:00:00'), { open: '07:00', close: '21:00' })).toBe(false);
  });
  it('returns false before open', () => {
    expect(isWithinSchedule(new Date('2026-05-30T06:59:00'), { open: '07:00', close: '21:00' })).toBe(false);
  });
});

describe('minutesBetween', () => {
  it('returns signed delta in minutes', () => {
    expect(minutesBetween(new Date('2026-05-30T09:00:00'), new Date('2026-05-30T09:10:00'))).toBe(10);
    expect(minutesBetween(new Date('2026-05-30T09:10:00'), new Date('2026-05-30T09:00:00'))).toBe(-10);
  });
});

describe('slotEnclosing', () => {
  it('snaps to the hour boundary for 60-min slots', () => {
    expect(slotEnclosing(new Date('2026-05-30T09:42:00'), 60)).toBe('2026-05-30T09:00:00');
  });
});
