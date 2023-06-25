import { RunStatus } from "../constants/runStatus.js";
import { Entity } from "./Entity.js";

export interface Run extends Entity {
  scraperId: number;
  status: RunStatus;
}
