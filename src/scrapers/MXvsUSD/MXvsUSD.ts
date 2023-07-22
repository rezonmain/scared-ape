import puppeteer from "puppeteer";
import type { DB } from "../../services/db/DB.js";
import { Scraper } from "../../services/Scraper.js";
import { Logger } from "../../utils/Logger.js";
import type { Telegram } from "../../services/notifier/Telegram/Telegram.js";
import { MXvsUSDDTOSchema, type MXvsUSDDTO } from "./MXvsUSD.dto.js";

/*
  Scrapes the list of jobs from the jobs page of the LMG website
*/
export class MXvsUSD extends Scraper<MXvsUSDDTO> {
  constructor(database: DB, notifier: Telegram) {
    super(database, notifier);
    this.url =
      "https://www.xe.com/currencyconverter/convert/?Amount=1&From=USD&To=MXN";
    this.dtoValidator = MXvsUSDDTOSchema;
    this.shouldNotifyChanges = false;
    this.status = "active";
    this.interval = 1 * 60 * 60 * 24;
  }

  get name(): string {
    return "MXvsUSD";
  }

  get knownId(): string {
    return "mx-vs-usd";
  }

  get associatedWidgets(): string[] {
    return ["MXVsUSD"];
  }

  get description(): string {
    return "Scrapes the MX vs USD exchange rate from xe.com";
  }

  async scrape(): Promise<void> {
    Logger.log(`🔄 [${this.name}] scraping...`);
    this.saveRun();
    let screenshot: Buffer;
    const rates: MXvsUSDDTO = {
      usdToMx: 0,
      mxToUsd: 0,
    };
    try {
      const browser = await puppeteer.launch({
        headless: "new",
        timeout: 60000,
      });
      const page = await browser.newPage();
      await page.goto(this.url);

      // Wait for the primary rate to load
      await page.waitForSelector(".result__BigRate-sc-1bsijpp-1");

      // Set screen size
      await page.setViewport({ width: 700, height: 1400 });
      screenshot = await page.screenshot();

      // Get the element that contains the primary rate
      const usdToMxP = await page.$(".result__BigRate-sc-1bsijpp-1");

      // Get the rate from the 2 different elements that compose it
      rates.usdToMx = await page.evaluate((el) => {
        const firstDigits = el.textContent;
        const secondDigits = el.querySelector("span").textContent;
        return parseFloat(`${firstDigits}${secondDigits}`);
      }, usdToMxP);

      // Wait for the secondary rate to load
      await page.waitForSelector(
        ".unit-rates___StyledDiv-sc-1dk593y-0 > p:nth-child(1)"
      );

      // Get the element that contains the secondary rate
      const mxToUsdP = await page.$(
        ".unit-rates___StyledDiv-sc-1dk593y-0 > p:nth-child(1)"
      );

      rates.mxToUsd = await page.evaluate((el) => {
        return parseFloat(
          el.innerHTML.substring(8, el.innerHTML.indexOf("USD"))
        );
      }, mxToUsdP);

      Logger.log(`🔄 [${this.name}] scraping done checking data...`);
      await browser.close();
    } catch (error) {
      Logger.error(`❌ [${this.name}] scraping failed`, error);
      await this.db.updateRunStatus(this.runId, "failure");
      throw error;
    }
    this.saveScrapedData(rates, screenshot);
  }
}
