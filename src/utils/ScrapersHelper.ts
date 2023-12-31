import fs from "fs/promises";
import config from "config";
import type { Scraper } from "../services/Scraper.js";
import type { IScraper } from "../models/Scraper.js";
import type { DB } from "../services/db/DB.js";
import type { Notifier } from "../services/notifier/Notifier.js";

/**
 * Utility functions for managing, creating scrapers.
 */
export class ScrapersHelper {
  static pathname = config.get("scrapers.path") as string;

  static async list(): Promise<string[]> {
    return await fs.readdir(this.pathname);
  }

  /**
   * Scraper factory
   * @param scraperName
   * @param db
   * @returns a Scraper instance
   */
  static async getScraperInstance(
    scraperName: string,
    db?: DB,
    notifier?: Notifier
  ): Promise<Scraper> {
    try {
      const scraper = await import(
        `../scrapers/${scraperName}/${scraperName}.js`
      );
      return new scraper[scraperName](db, notifier);
    } catch (error) {
      throw new Error(`Scraper ${scraperName} not found, ${error}`);
    }
  }

  static async getAll(): Promise<Scraper[]> {
    return await Promise.all(
      (
        await this.list()
      ).map(async (path) => await this.getScraperInstance(path))
    );
  }

  static toKnownIdList(scrapers: IScraper[]): IScraper["knownId"][] {
    return scrapers.map((s) => s.knownId);
  }
}
