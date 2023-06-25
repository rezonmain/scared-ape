/*
  This is the base class for all scrapers.
*/
export abstract class Scraper {
  abstract get name(): string;
  abstract get knownId(): string;
  abstract get associatedWidgets(): string[];
  abstract scrape(): Promise<void>;
}
