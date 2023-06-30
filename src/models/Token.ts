import type { Entity } from "./Entity.js";

export interface Token extends Entity {
  userId: number | bigint;
  token: string;
  expiresAt: Date;
}
