import puppeteer from "puppeteer";
import { DB } from "../../services/DB.js";
import { Scraper } from "../../services/Scraper.js";
import type { Browser, Page } from "puppeteer";
import { LMGJobsDTO, LMGJobsDTOSchema } from "./LMGJobs.dto.js";
import { Logger } from "../../utils/Logger.js";
import { CacheHelper } from "../../utils/CacheHelper.js";
import { Run } from "../../models/Run.js";

/*
  Scrapes the list of jobs from the jobs page of the LMG website
*/

// TODO: some of the logic can be moved to the base class
export class LMGJobs extends Scraper {
  constructor(database: DB) {
    super(database);
  }

  protected url: string = "https://linusmediagroup.com/jobs";
  protected browser: Browser;
  protected page: Page;
  private runId: Run["id"];

  get name(): string {
    return "LMGJobs";
  }

  get knownId(): string {
    return "lmg-jobs";
  }

  get associatedWidgets(): string[] {
    return ["LMG_jobs"];
  }

  private async saveRun(): Promise<void> {
    this.runId = await this.db.saveRun(this.knownId);
  }

  private async saveJson(data: LMGJobsDTO[]): Promise<void> {
    const parsedData = await this.validateJson(data);
    const latestHash = await this.db.getLatestJsonHash(this.knownId);
    const json = JSON.stringify(parsedData);
    const cacheHash = await CacheHelper.hashData(json);

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

  private async validateJson(data: LMGJobsDTO[]): Promise<LMGJobsDTO[]> {
    try {
      const parsed = data.map((item) => LMGJobsDTOSchema.parse(item));
      Logger.log(`🔄 [${this.name}] scraped data matches DTO, saving to db...`);
      return parsed;
    } catch (error) {
      Logger.error(
        `❌ [${this.name}] validation failed for run ${this.runId}, ${error}`
      );
      await this.db.updateRunStatus(this.runId, "failure");
    }
  }

  async scrape(): Promise<void> {
    Logger.log(`🔄 [${this.name}] scraping...`);
    this.saveRun();
    try {
      const browser = await puppeteer.launch({ headless: "new" });
      const page = await browser.newPage();
      await page.goto(this.url);

      // Wait for the jobs list to load
      await page.waitForSelector(".accordion-items-container");

      // Get the jobs list <ul> element
      const jobsUl = await page.$(".accordion-items-container");

      // Generate the list of jobs from the <ul> element as the scraper DTO
      const listings: LMGJobsDTO[] = await page.evaluate(
        (el) =>
          Array.from(el.querySelectorAll(".accordion-item")).map((li) => {
            const title = li
              .querySelector(".accordion-item__title")
              .textContent.trim();

            const location = li
              .querySelector("div > div > p:nth-child(1)")
              .textContent.replace("Location: ", "")
              .trim();

            const employment = li
              .querySelector("div > div > p:nth-child(2)")
              .textContent.replace("Employment: ", "")
              .trim();

            const description = li
              .querySelector("div > div > p:nth-child(3)")
              .textContent.trim();

            const jobRequirements = Array.from(
              Array.from(document.querySelectorAll("p"))
                .find((el) => el.textContent.includes("Job Requirements"))
                .nextElementSibling.querySelectorAll("li")
            ).map((el) => el.textContent.trim());

            const applyUrl = li.querySelector("a").href.toString();
            return {
              title,
              content: { location, employment, description, jobRequirements },
              applyUrl,
            };
          }),
        jobsUl
      );
      Logger.log(`🔄 [${this.name}] scraping done checking data...`);
      await browser.close();
      await this.saveJson(listings);
    } catch (error) {}
  }
}
