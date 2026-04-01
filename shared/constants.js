// ── Token Statuses ──
export const TOKEN_STATUS = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
  CANCELLED: 'cancelled',
};

// ── Priority Levels (higher number = higher priority) ──
export const PRIORITY = {
  EMERGENCY: { value: 'emergency', level: 3, label: 'Emergency', color: '#ef4444' },
  SENIOR: { value: 'senior', level: 2, label: 'Senior Citizen', color: '#f59e0b' },
  GENERAL: { value: 'general', level: 1, label: 'General', color: '#3b82f6' },
};

export const PRIORITY_VALUES = ['emergency', 'senior', 'general'];

// ── Socket Events ──
export const SOCKET_EVENTS = {
  // Server → Client
  TOKEN_CREATED: 'token_created',
  QUEUE_UPDATED: 'queue_updated',
  PATIENT_CALLED: 'patient_called',
  CONSULTATION_COMPLETE: 'consultation_complete',
  WAIT_TIME_UPDATED: 'wait_time_updated',
  EMERGENCY_ALERT: 'emergency_alert',
  CONNECTION_STATUS: 'connection_status',

  // Client → Server
  JOIN_ROOM: 'join_room',
  REQUEST_QUEUE: 'request_queue',
};

// ── Rooms ──
export const ROOMS = {
  QUEUE: 'queue-room',
  DOCTOR: 'doctor-room',
  DISPLAY: 'display-room',
  RECEPTION: 'reception-room',
};

// ── Departments ──
export const DEPARTMENTS = ['OPD', 'ENT', 'Orthopedics', 'Pediatrics', 'Cardiology', 'General Medicine'];

// ── Default Config ──
export const CONFIG = {
  DEFAULT_AVG_CONSULT_TIME: 10, // minutes
  ROLLING_AVERAGE_WINDOW: 20,   // last N consultations
  WAIT_TIME_CACHE_TTL: 30,      // seconds
  MAX_DISPLAY_TOKENS: 6,
  TOKEN_PREFIX: 'A',
};
