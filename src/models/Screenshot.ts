import type { Entity } from "./Entity.js";

export interface Screenshot extends Entity {
  scraperId: number;
  runId: number;
  image: string;
}
