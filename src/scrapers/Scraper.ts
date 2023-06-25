import type { Browser, Page } from "puppeteer";
/*
  This is the base class for all scrapers.
*/
export abstract class Scraper {
  protected browser: Browser;
  protected page: Page;
}
