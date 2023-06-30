import type { Entity } from "./Entity.js";

export interface Challenge extends Entity {
  userId: number | bigint;
  challenge: string;
  expiresAt: string;
}
