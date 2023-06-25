import { IScraper } from "../models/Scraper.js";
import { DB } from "./DB.js";

/*
  This is the base class for all scrapers.
*/
export abstract class Scraper {
  protected db: DB;
  constructor(db?: DB) {
    this.db = db;
  }
  abstract get name(): string;
  abstract get knownId(): string;
  abstract get associatedWidgets(): string[];
  abstract scrape(): Promise<void>;
  get model(): IScraper {
    return {
      name: this.name,
      knownId: this.knownId,
      associatedWidgets: this.associatedWidgets,
    };
  }
}
