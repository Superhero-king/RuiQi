export interface Site {
  id: string;
  name: string;
  sslEnabled: boolean;
  port: number;
  note: string;
  protectionStatus: string;
  todayProtection: string;
  lastAttackTime: string;
  upstream: string;
} 