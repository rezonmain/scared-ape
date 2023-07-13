export interface Revocation {
  jwtHash: string;
  revocationDate: string; // ISO date
  createdAt?: Date;
}
