import type { JsonStatus } from "../constants/jsonStatus.js";
import type { Entity } from "./Entity.js";

export interface Json extends Entity {
  scraperId: number;
  runId: number | bigint;
  json: string;
  cacheHash: string;
  status?: JsonStatus; // default "latest"
}
