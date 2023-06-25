import { Scraper } from "./Scraper.js";

export class ScraperFactory {
  static async getScraperInstance(scraperName: string): Promise<Scraper> {
    try {
      const scraper = await import(`./${scraperName}/${scraperName}.js`);
      return new scraper[scraperName]();
    } catch (error) {
      throw new Error(`Scraper ${scraperName} not found`);
    }
  }
}
