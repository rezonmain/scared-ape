import type { DB } from "./services/db/DB.js";
import { SQLiteDB } from "./services/db/SQLiteDB.js";
import { Seeder } from "./services/Seeder.js";
import { ScrapersHelper } from "./utils/ScrapersHelper.js";
import { Logger } from "./utils/Logger.js";
import type { IScraper } from "./models/Scraper.js";
import { Scheduler } from "./services/scheduler/Scheduler.js";
import { Api } from "./services/api/Api.js";

/**
 * The main app class
 */
export class ScaredApe {
  private db: DB;
  private api: Api;
  private scheduler: Scheduler;
  constructor() {
    this.db = new SQLiteDB();
    this.scheduler = new Scheduler(this.db);
    this.api = new Api(this.db, this.scheduler);
  }

  private async runScraper(name: IScraper["name"]) {
    const scraper = await ScrapersHelper.getScraperInstance(name, this.db);
    await scraper.scrape();
  }

  /**
   * Bootstrap the app
   * - Connect to the database
   * - Run migrations
   * - Seed the database
   * - Run all the active scrapers
   */
  async bootstrap() {
    await this.db.connect();
    await this.db.migrate();
    const seeder = new Seeder(this.db);
    await seeder.seed();
    // Run all the active scrapers
    Logger.log("🔄 [🦍App][run()] Starting active scrapers...");
    const activeScrapers = await this.db.getActiveScrapers();
    await Promise.all(
      activeScrapers.map((scraper) => this.runScraper(scraper.name))
    );
    Logger.log("✅ [🦍App][run()] All active scrapers finished running.");
    await this.db.disconnect();
  }

  /**
   * Run the app
   * - Connect to the database
   * - Start the scheduler
   * - Start the api
   */
  async run() {
    this.db.connect();
    this.scheduler.start();
    this.api.start();
  }
}
