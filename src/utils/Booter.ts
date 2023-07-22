import { Client } from "node-scp";
import type { DB } from "../services/db/DB.js";
import { Seeder } from "../services/Seeder.js";
import { Logger } from "./Logger.js";
import { ScrapersHelper } from "./ScrapersHelper.js";
import type { IScraper } from "../models/Scraper.js";
import { FileHelper } from "./FileHelper.js";
import { isNothing } from "./ez.js";
import { SQLiteDB } from "../services/db/SQLiteDB.js";
import config from "config";

/**
 * Automate the app bootrapping process
 */
export class Booter {
  private environment: string;
  private localConfigPath: string;
  private remoteConfigPath: string;
  private db: DB;
  constructor(environment?: string) {
    this.db = new SQLiteDB();
    this.environment = environment ?? process.env.NODE_ENV ?? "dev";
    this.remoteConfigPath = `/home/${process.env.SCP_USER}/vault/scared-ape/${this.env}.json5`;
    this.localConfigPath = `config/${this.env}.json5`;
  }

  get env() {
    return this.environment;
  }

  private async runScraper(name: IScraper["name"]) {
    // Run scraper without a notfier so that it doesn't send notifications
    const scraper = await ScrapersHelper.getScraperInstance(name, this.db);
    await scraper.scrape();
  }

  private async initialScrape(scrape = false) {
    if (!scrape) return;
    // Get all active scrapers
    Logger.log("🔄 [👾Booter][boot()] Getting missing active scrapers...");
    const activeScrapers = await this.db.getActiveScrapers();
    const notRanScrapers = (
      await Promise.all(
        activeScrapers.map(async (scraper) => {
          const json = await this.db.getLatestJson(scraper.knownId);
          if (isNothing(json)) return scraper;
          return undefined;
        })
      )
    ).filter((s) => s);
    Logger.log(
      `🔄 [👾Booter][boot()] Running missing active scrapers ${notRanScrapers
        .map((s) => s.name)
        .join(", ")}`
    );
    await Promise.all(
      notRanScrapers.map((scraper) => this.runScraper(scraper.name))
    );
    Logger.log(
      "✅ [👾Booter][boot()] All missing active scrapers finished running."
    );
  }

  private async loadConfig() {
    Logger.log("🔄 [👾Booter][loadConfig()] Loading configuration...");
    const path = this.localConfigPath;
    if (!(await FileHelper.exists(path))) {
      Logger.log(
        `🚨 [👾Booter][loadConfig()] No config file found at ${path}, fetching config file from remote ${this.remoteConfigPath}`
      );
      await this.fetchConfigFile(path);
      const newConfig = config.util.loadFileConfigs();
      config.util.extendDeep(newConfig, config);
    }
    Logger.log("✅ [👾Booter][loadConfig()] Configuration loaded.");
  }

  private async fetchConfigFile(destinationPath: string) {
    try {
      const client = await Client({
        host: process.env.SCP_HOST,
        port: 22,
        username: process.env.SCP_USER,
        privateKey: process.env.SCP_KEY,
      });
      await client.downloadFile(this.remoteConfigPath, destinationPath);
      Logger.log(
        "✅ [👾Booter][fetchConfigFile()] Successfully fetched remote config file"
      );
      client.close();
    } catch (error) {
      Logger.log(
        "🚨 [👾Booter][fetchConfigFile()] Error while fetching config file"
      );
      Logger.error(error);
      process.exit(1);
    }
  }

  /**
   * Boot the app.
   *
   * Bootstrapping scared ape includes:
   * - Adding missing configuration values
   * - Creating SQLite DB
   * - Running migrations
   * - Seeding database
   * - Initial data scrape run
   */
  async boot(opts: { scrapeOnBoot?: boolean } = { scrapeOnBoot: false }) {
    Logger.log("🔄 [👾Booter][boot()] Booting scared-ape...");
    await this.loadConfig();
    await this.db.connect();
    await this.db.migrate();
    const seeder = new Seeder(this.db);
    await seeder.seed();
    try {
      await this.initialScrape(opts.scrapeOnBoot);
    } catch (err) {
      Logger.log("🚨 [👾Booter][boot()] Error while running initial scrape");
      Logger.log(err);
    }
    Logger.log("✅ [👾Booter][boot()] Booted scared-ape.");
  }
}
