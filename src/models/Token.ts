import type { Entity } from "./Entity.js";

export interface Token extends Entity {
  userId: number;
  token: string;
  expiresAt: Date;
}
