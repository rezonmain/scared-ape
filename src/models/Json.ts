import { JsonStatus } from "../constants/jsonStatus.js";
import { Entity } from "./Entity.js";

export interface Json extends Entity {
  scraperId: number;
  runId: number;
  json: string;
  cacheHash: string;
  status: JsonStatus;
}
