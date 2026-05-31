import type { AppState, User, Area, Reservation } from './types';

export const AREA_GIMNASIO = 'a-gimnasio';
export const AREA_CAFETERIA = 'a-cafeteria';

export function buildSeed(now: Date): AppState {
  const today = now.toISOString().slice(0, 10);
  const farFuture = '2099-12-31';

  const areas: Area[] = [
    {
      id: AREA_GIMNASIO,
      name: 'Gimnasio de pesas',
      archetype: 'slot-bookable',
      schedule: { open: '06:00', close: '22:00' },
      slotDurationMin: 60,
      capacityPerSlot: 8,
      requiresMembership: true,
      freeCategories: ['caribes'],
    },
    {
      id: AREA_CAFETERIA,
      name: 'Cafetería Caribes',
      archetype: 'drop-in',
      schedule: { open: '07:00', close: '21:00' },
      allowedCategories: [
        'estudiante', 'profesor', 'trabajador',
        'caribes', 'comunidad', 'externo', 'egresado',
      ],
    },
  ];

  const users: User[] = [
    { id: 'u-juan',   name: 'Juan',   category: 'estudiante', qrToken: 'qr-juan' },
    { id: 'u-ana',    name: 'Ana',    category: 'caribes',    qrToken: 'qr-ana' },
    { id: 'u-carlos', name: 'Carlos', category: 'profesor',   qrToken: 'qr-carlos' },
    { id: 'u-maria',  name: 'María',  category: 'comunidad',  qrToken: 'qr-maria',
      membership: { area: AREA_GIMNASIO, validUntil: farFuture } },
    { id: 'u-pedro',  name: 'Pedro',  category: 'externo',    qrToken: 'qr-pedro' },
    { id: 'u-lucia',  name: 'Lucía',  category: 'egresado',   qrToken: 'qr-lucia',
      membership: { area: AREA_GIMNASIO, validUntil: farFuture } },
  ];

  const reservations: Reservation[] = [
    { id: 'r-001', userId: 'u-ana',   areaId: AREA_GIMNASIO, slotStart: `${today}T08:00:00`, status: 'active' },
    { id: 'r-002', userId: 'u-maria', areaId: AREA_GIMNASIO, slotStart: `${today}T12:00:00`, status: 'active' },
    { id: 'r-003', userId: 'u-ana',   areaId: AREA_GIMNASIO, slotStart: `${today}T18:00:00`, status: 'active' },
    { id: 'r-004', userId: 'u-lucia', areaId: AREA_GIMNASIO, slotStart: `${today}T19:00:00`, status: 'active' },
  ];

  return { users, areas, reservations, accessLogs: [] };
}
