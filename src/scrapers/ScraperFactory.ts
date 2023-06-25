export class ScraperFactory {
  static async getScraper(scraperName: string) {
    switch (scraperName) {
      case "LMGJobs":
        const LMGJobs = (await import("./LMGJobs.js")).LMGJobs;
        return new LMGJobs();
      default:
        throw new Error("Scraper not found.");
    }
  }
}
