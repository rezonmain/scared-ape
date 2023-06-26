import { Browser } from "puppeteer";
import { DB } from "./services/DB.js";
import { SQLiteDB } from "./services/SQLiteDB.js";
import { Seeder } from "./services/Seeder.js";
import { Scraper } from "./services/Scraper.js";
import { ScrapersHelper } from "./utils/ScrapersHelper.js";
import { Logger } from "./utils/Logger.js";

export class ScaredApe {
  private db: DB;
  private api;
  private scheduler;
  constructor() {
    this.db = new SQLiteDB();
  }

  async bootstrap() {
    await this.db.connect();
    await this.db.migrate();
    const seeder = new Seeder(this.db);
    await seeder.seed();
  }

  async run() {
    // Run all the active scrapers
    Logger.log("🚀 [App][run()] Starting active scrapers...");
    const activeScrapers = await this.db.getActiveScrapers();
    await Promise.all(
      activeScrapers.map((scraper) => this.runScraper(scraper.name))
    );
    Logger.log("🚀 [App][run()] All active scrapers finished running.");
    Logger.log("🚀 [App][run()] Starting scheduler...");
    // this.scheduler.start();
    // this.api.start();
  }

  private async runScraper(name: Scraper["name"]) {
    const scraper = await ScrapersHelper.getScraperInstance(name, this.db);
    await scraper.scrape();
  }
}
