import { DB } from "./services/db/DB.js";
import { SQLiteDB } from "./services/db/SQLiteDB.js";
import { Seeder } from "./services/Seeder.js";
import { ScrapersHelper } from "./utils/ScrapersHelper.js";
import { Logger } from "./utils/Logger.js";
import { IScraper } from "./models/Scraper.js";
import { Scheduler } from "./services/Scheduler.js";
import { Api } from "./services/api/Api.js";

export class ScaredApe {
  private db: DB;
  private api;
  private scheduler;
  constructor() {
    this.db = new SQLiteDB();
    this.scheduler = new Scheduler(this.db);
    this.api = new Api();
  }

  async bootstrap() {
    await this.db.connect();
    await this.db.migrate();
    const seeder = new Seeder(this.db);
    await seeder.seed();
  }

  async run() {
    // Run all the active scrapers
    Logger.log("🔄 [🦍App][run()] Starting active scrapers...");
    const activeScrapers = await this.db.getActiveScrapers();
    await Promise.all(
      activeScrapers.map((scraper) => this.runScraper(scraper.name))
    );
    Logger.log("✅ [🦍App][run()] All active scrapers finished running.");
    this.scheduler.start();
    this.api.start();
  }

  private async runScraper(name: IScraper["name"]) {
    const scraper = await ScrapersHelper.getScraperInstance(name, this.db);
    await scraper.scrape();
  }
}
