import { IScraper } from "../../models/Scraper.js";
import { DB } from "../../services/DB.js";
import { Scraper } from "../../services/Scraper.js";
import type { Browser, Page } from "puppeteer";

/*
  Scrapes the list of jobs from the jobs page of the LMG website
*/
export class LMGJobs extends Scraper {
  constructor(database: DB) {
    super(database);
  }

  protected url: string = "https://linusmediagroup.com/jobs";
  protected browser: Browser;
  protected page: Page;

  get name(): string {
    return "LMGJobs";
  }

  get knownId(): string {
    return "lmg-jobs";
  }

  get associatedWidgets(): string[] {
    return ["LMG_jobs"];
  }

  async scrape(): Promise<void> {}
}
