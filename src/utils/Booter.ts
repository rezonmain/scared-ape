import type { DB } from "../services/db/DB.js";
import type { Cache } from "../services/cache/Cache.js";
import { Seeder } from "../services/Seeder.js";
import { Logger } from "./Logger.js";
import { ScrapersHelper } from "./ScrapersHelper.js";
import type { IScraper } from "../models/Scraper.js";
import JSON5 from "json5";
import { FileHelper } from "./FileHelper.js";
import { isNothingOrZero } from "./ez.js";

/**
 * Automate the app bootrapping process
 *
 */
export class Booter {
  private environment: string;
  constructor(private db: DB, private cache: Cache, environment?: string) {
    this.environment = environment ?? process.env.NODE_ENV ?? "dev";
  }

  get env() {
    return this.environment;
  }

  private async runScraper(name: IScraper["name"]) {
    // Run scraper without a notfier so that it doesn't send notifications
    const scraper = await ScrapersHelper.getScraperInstance(name, this.db);
    await scraper.scrape();
  }

  private async getMissingConfigValues(): Promise<Set<string>> {
    const missing = new Set<string>();
    const config = JSON5.parse(
      await FileHelper.asString("config/default.json5")
    );

    const parseMissing = (config: unknown, path: string) => {
      if (typeof config === "object") {
        for (const [key, value] of Object.entries(config)) {
          // Recurse to get nested config values
          parseMissing(value, `${path}.${key}`);
        }
      } else {
        // If we reached this it means it's a leaf node with a primitive value
        if (isNothingOrZero(config)) {
          missing.add(path);
        }
      }
    };
    parseMissing(config, "");
    return missing;
  }

  private async configWizard() {
    const missing = await this.getMissingConfigValues();
    missing.forEach((key) => {
      Logger.log(`🔄 [👾Booter][configWizard()] Missing config value: ${key}`);
    });
    return;
  }

  /**
   * Boot the app.
   *
   * Bootrspping scared ape includes:
   * - Adding missing configuration values
   * - Creating SQLite DB
   * - Running migrations
   * - Seeding database
   * - Initial data scrape run
   */
  async boot() {
    Logger.log("🔄 [👾Booter][boot()] Booting scared-ape...");
    await this.configWizard();
    await this.db.connect();
    await this.db.migrate();
    const seeder = new Seeder(this.db);
    await seeder.seed();
    // Run all the active scrapers
    Logger.log("🔄 [👾Booter][boot()] Starting active scrapers...");
    const activeScrapers = await this.db.getActiveScrapers();
    await Promise.all(
      activeScrapers.map((scraper) => this.runScraper(scraper.name))
    );
    Logger.log("✅ [👾Booter][boot()] All active scrapers finished running.");
    this.cache.flush();
  }
}
