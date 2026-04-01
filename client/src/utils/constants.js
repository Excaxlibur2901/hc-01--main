export const PRIORITIES = [
  { value: 'general', label: 'General', icon: '🏥', color: 'sky', desc: 'Standard queue position' },
  { value: 'senior', label: 'Senior Citizen', icon: '👴', color: 'amber', desc: 'Priority for age 60+' },
  { value: 'emergency', label: 'Emergency', icon: '🚨', color: 'red', desc: 'Immediate medical attention' }
];

export const STATUS_COLORS = {
  waiting: 'sky',
  'in-progress': 'emerald',
  completed: 'green',
  cancelled: 'gray'
};

export const DEPTS = ['General OPD', 'Cardiology', 'Orthopedics'];

export const TOKEN_PREFIX = 'A';

