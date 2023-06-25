import { Entity } from "./Entity.js";

export interface Scraper extends Entity {
  knownId: string;
  name: string;
  associatedWidgets: string[];
}
