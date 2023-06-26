import type { RunStatus } from "../constants/runStatus.js";
import type { Entity } from "./Entity.js";

export interface Run extends Entity {
  scraperId: number;
  status: RunStatus; // default "running"
}
