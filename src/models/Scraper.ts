import type { ScraperStatus } from "../constants/scraperStatus.js";
import type { Entity } from "./Entity.js";

export interface IScraper extends Entity {
  knownId: string;
  name: string;
  associatedWidgets: string[];
  status?: ScraperStatus; // defualt "inactive"
  interval?: number; // in seconds, default 24 hrs so 86400
  shouldNotifyChanges?: boolean; // default false
}
