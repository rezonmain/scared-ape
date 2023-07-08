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
  get description() {
    return this.opts.description;
  }
  get url() {
    return this.opts.url;
  }

  get dto(): IScraper {
    return {
      knownId: this.knownId,
      name: this.name,
      associatedWidgets: this.associatedWidgets,
      status: this.status,
      interval: this.interval,
      shouldNotifyChanges: this.shouldNotifyChanges,
      description: this.description,
      url: this.url,
    };
  }
}

export { ScraperDto };
