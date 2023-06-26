import puppeteer from "puppeteer";
import type { DB } from "../../services/db/DB.js";
import { Scraper } from "../../services/Scraper.js";
import type { LMGJobsDTO } from "./LMGJobs.dto.js";
import { LMGJobsDTOSchema } from "./LMGJobs.dto.js";
import { Logger } from "../../utils/Logger.js";

/*
  Scrapes the list of jobs from the jobs page of the LMG website
*/
export class LMGJobs extends Scraper<LMGJobsDTO> {
  constructor(database: DB) {
    super(database);
    this.url = "https://linusmediagroup.com/jobs";
    this.dtoValidator = LMGJobsDTOSchema;
    this.shouldNotifyChanges = true;
    this.status = "active";
    this.interval = 1 * 60 * 60 * 24;
  }

  get name(): string {
    return "LMGJobs";
  }

  get knownId(): string {
    return "lmg-jobs";
  }

  get associatedWidgets(): string[] {
    return ["LMG_jobs"];
  }

  async scrape(): Promise<void> {
    Logger.log(`🔄 [${this.name}] scraping...`);
    this.saveRun();
    let listings: LMGJobsDTO[] = [];
    let screenshot: Buffer;
    try {
      const browser = await puppeteer.launch({ headless: "new" });
      const page = await browser.newPage();
      await page.goto(this.url);

      // Wait for the jobs list to load
      await page.waitForSelector(".accordion-items-container");
      screenshot = await page.screenshot();

      // Get the jobs list <ul> element
      const jobsUl = await page.$(".accordion-items-container");

      // Generate the list of jobs from the <ul> element as the scraper DTO
      listings = await page.evaluate(
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
    } catch (error) {
      Logger.error(`❌ [${this.name}] scraping failed`, error);
      await this.db.updateRunStatus(this.runId, "failure");
      throw error;
    }
    this.saveScrapedData(listings, screenshot);
  }
}
