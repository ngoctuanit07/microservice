export interface HostEntity {
  id: number;
  ip: string;
  port: number;
  uid: string;
  pwdEnc: string;    // encrypted
  purchasedAt: Date;
  expiredAt: Date;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
