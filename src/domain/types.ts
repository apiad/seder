export type ISODate = string;       // 'YYYY-MM-DD'
export type ISODateTime = string;   // 'YYYY-MM-DDTHH:mm:ss'
export type HHMM = string;          // 'HH:mm'
export type AreaId = string;
export type UserId = string;
export type ReservationId = string;
export type AccessLogId = string;

export type Category =
  | 'estudiante'
  | 'profesor'
  | 'trabajador'
  | 'caribes'
  | 'comunidad'
  | 'externo'
  | 'egresado';

export type Membership = {
  area: AreaId;
  validUntil: ISODate;
};

export type User = {
  id: UserId;
  name: string;
  category: Category;
  membership?: Membership;
  qrToken: string;
};

export type AreaArchetype = 'slot-bookable' | 'drop-in';

export type Area = {
  id: AreaId;
  name: string;
  archetype: AreaArchetype;
  schedule: { open: HHMM; close: HHMM };
  slotDurationMin?: number;
  capacityPerSlot?: number;
  requiresMembership?: boolean;
  freeCategories?: Category[];
  allowedCategories?: Category[];
};

export type ReservationStatus = 'active' | 'used' | 'cancelled' | 'no-show';

export type Reservation = {
  id: ReservationId;
  userId: UserId;
  areaId: AreaId;
  slotStart: ISODateTime;
  status: ReservationStatus;
};

export type AccessLog = {
  id: AccessLogId;
  ts: ISODateTime;
  userId: UserId;
  areaId: AreaId;
  result: 'admit' | 'deny';
  reason?: string;
};

export type DenyReason =
  | 'sin reserva'
  | 'fuera de ventana'
  | 'membresía expirada'
  | 'categoría no admitida'
  | 'fuera de horario';

export type ScanResult =
  | { result: 'admit' }
  | { result: 'deny'; reason: DenyReason };

export type AppState = {
  users: User[];
  areas: Area[];
  reservations: Reservation[];
  accessLogs: AccessLog[];
  activeUserId?: UserId;
  activeOperatorName?: string;
};
