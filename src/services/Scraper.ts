import type { z } from "zod";
import puppeteer, { type LaunchOptions } from "puppeteer";
import type { Run } from "../models/Run.js";
import type { IScraper } from "../models/Scraper.js";
import type { DB } from "./db/DB.js";
import { CacheHelper } from "../utils/CacheHelper.js";
import { Logger } from "../utils/Logger.js";
import type { ScraperStatus } from "../constants/scraperStatus.js";
import type { Telegram } from "./notifier/Telegram/Telegram.js";
import { common } from "../constants/puppeteer.config.js";

/*
  This is the base class for all scrapers.
*/
export abstract class Scraper<Dto = void> {
  protected runId: Run["id"];
  protected url: string;
  protected dtoValidator: z.ZodSchema<Dto>;
  protected shouldNotifyChanges: boolean;
  protected status: ScraperStatus;
  protected interval: IScraper["interval"]; // In seconds
  constructor(protected db?: DB, protected notifier?: Telegram) {}
  abstract get name(): string;
  abstract get knownId(): string;
  abstract get associatedWidgets(): string[];
  abstract get description(): string;
  /**
   * Create a run entry in the database and saves the runId
   */
  protected async saveRun(): Promise<void> {
    this.runId = await this.db.saveRun(this.knownId);
  }
  /**
   * Validates and saves the Json data from the scraping run to the database
   * @param data
   */
  protected async saveScrapedData(
    data: Dto | Dto[],
    screenshot: Buffer
  ): Promise<void> {
    const parsedData = this.validateJson(data);
    const latestHash = await this.db.getLatestJsonHash(this.knownId);
    const json = JSON.stringify(parsedData);
    const cacheHash = CacheHelper.hashData(json);

    if (!latestHash || (latestHash && latestHash !== cacheHash)) {
      Logger.log(`✅ [${this.name}] data change detected, saving new Json`);

      // Get the latest now-busted Json and update its status to "busted"
      const jsonToBust = await this.db.getLatestJson(this.knownId);
      if (jsonToBust) {
        await this.db.updateJson({ ...jsonToBust, status: "busted" });
      }

      // Save the new updated Json
      await this.db.saveJson(this.knownId, {
        json,
        cacheHash,
        runId: this.runId,
      });

      // Save the screenshot
      /**
       * TODO: Uncomment this when the screenshot feature is ready
       */
      // await this.saveScreenshot(screenshot);

      // Update this run status
      await this.db.updateRunStatus(this.runId, "success");

      // Notify the changes
      if (this.shouldNotifyChanges && this.notifier) {
        this.notifier.send({
          message: `Scraper ${this.name} detected changes!, check them out at ${this.url}`,
        });
      }
      return;
    }
    Logger.log(`✅ [${this.name}] no data change detected, skipping save`);
    await this.db.updateRunStatus(this.runId, "cached");
  }
  private validateJson(data: Dto | Dto[]): Dto | Dto[] {
    let parsed: Dto | Dto[];
    try {
      if (Array.isArray(data)) {
        parsed = data.map((item) => this.dtoValidator.parse(item));
      } else {
        parsed = this.dtoValidator.parse(data);
      }
      Logger.log(`🔄 [${this.name}] scraped data matches DTO, saving to db...`);
      return parsed;
    } catch (error) {
      Logger.error(
        `❌ [${this.name}] validation failed for run ${this.runId}, ${error}`
      );
      this.db.updateRunStatus(this.runId, "failure");
      throw error;
    }
  }
  protected async saveScreenshot(screenshot: Buffer): Promise<void> {
    const base64String = btoa(
      String.fromCharCode(...new Uint8Array(screenshot))
    );
    await this.db.saveScreenshot(this.runId, this.knownId, base64String);
  }
  protected async launchBrowser(
    config?: LaunchOptions
  ): Promise<puppeteer.Browser> {
    return await puppeteer.launch({ ...common, ...config });
  }
  /**
   * Scrapes the data from the website and saves it to the database
   * @param data
   */
  abstract scrape(): Promise<void>;
  get model(): IScraper {
    return {
      name: this.name,
      status: this.status,
      knownId: this.knownId,
      interval: this.interval,
      associatedWidgets: this.associatedWidgets,
      shouldNotifyChanges: this.shouldNotifyChanges,
      description: this.description,
      url: this.url,
    };
  }
}
