import fs from "fs/promises";
import config from "config";
import { Scraper } from "../services/Scraper.js";
import { Scraper as ScraperModel } from "../models/Scraper.js";
import { DB } from "../services/DB.js";

export class ScrapersHelper {
  static pathname = config.get("scrapers.path") as string;

  static async list(): Promise<string[]> {
    return await fs.readdir(this.pathname);
  }

  static async getScraperInstance(
    scraperName: string,
    db?: DB
  ): Promise<Scraper> {
    try {
      const scraper = await import(
        `../scrapers/${scraperName}/${scraperName}.js`
      );
      return new scraper[scraperName](db);
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

  static toKnownIdList(scrapers: ScraperModel[]): ScraperModel["knownId"][] {
    return scrapers.map((s) => s.knownId);
  }
}