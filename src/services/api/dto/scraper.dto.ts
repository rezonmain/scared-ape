import type { IScraper } from "../../../models/Scraper.js";

class ScraperDto implements IScraper {
  constructor(private opts: IScraper) {}
  get knownId() {
    return this.opts.knownId;
  }
  get name() {
    return this.opts.name;
  }
  get associatedWidgets() {
    return this.opts.associatedWidgets;
  }
  get status() {
    return this.opts.status;
  }
  get interval() {
    return this.opts.interval;
  }
  get shouldNotifyChanges() {
    return this.opts.shouldNotifyChanges;
  }
}

export { ScraperDto };
