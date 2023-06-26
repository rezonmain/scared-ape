import { object, z } from "zod";
import { Run } from "../models/Run.js";
import { IScraper } from "../models/Scraper.js";
import { DB } from "./db/DB.js";
import { CacheHelper } from "../utils/CacheHelper.js";
import { Logger } from "../utils/Logger.js";

/*
  This is the base class for all scrapers.
*/
export abstract class Scraper<Dto = void> {
  protected db: DB;
  protected runId: Run["id"];
  protected url: string;
  protected dtoValidator: z.ZodSchema<Dto>;
  constructor(db?: DB) {
    this.db = db;
  }
  abstract get name(): string;
  abstract get knownId(): string;
  abstract get associatedWidgets(): string[];
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
  protected async saveJson(data: Dto | Dto[]): Promise<void> {
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

      // Update this run status
      await this.db.updateRunStatus(this.runId, "success");
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
  /**
   * Scrapes the data from the website and saves it to the database
   * @param data
   */
  abstract scrape(): Promise<void>;
  get model(): IScraper {
    return {
      name: this.name,
      knownId: this.knownId,
      associatedWidgets: this.associatedWidgets,
    };
  }
}
