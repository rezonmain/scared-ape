import type { DB } from "../services/db/DB.js";
import { Seeder } from "../services/Seeder.js";
import { Logger } from "./Logger.js";
import { ScrapersHelper } from "./ScrapersHelper.js";
import type { IScraper } from "../models/Scraper.js";
import JSON5 from "json5";
import { FileHelper } from "./FileHelper.js";
import { isNothingOrZero } from "./ez.js";
import c from "config";
import { Telegram } from "../services/notifier/Telegram/Telegram.js";
import inquirer from "inquirer";
import _ from "lodash";
import { SQLiteDB } from "../services/db/SQLiteDB.js";

/**
 * Automate the app bootrapping process
 *
 */
export class Booter {
  private environment: string;
  private inputConfig: object;
  private defaultConfig: object;
  private db: DB;
  constructor(environment?: string) {
    this.db = new SQLiteDB();
    this.environment = environment ?? process.env.NODE_ENV ?? "dev";
    this.inputConfig = {};
  }

  get env() {
    return this.environment;
  }

  private async runScraper(name: IScraper["name"]) {
    // Run scraper without a notfier so that it doesn't send notifications
    const scraper = await ScrapersHelper.getScraperInstance(name, this.db);
    await scraper.scrape();
  }

  private async saveConfigFile() {
    const path = `config/local-${this.env}.json5`;
    Logger.log(
      `🔄 [👾Booter][saveConfigFile()] saving configuration file to ${path}...`
    );
    const config = _.merge(this.defaultConfig, this.inputConfig);
    await FileHelper.write(path, config);
    await c.util.loadFileConfigs(`${this.env}.json5`);
  }

  private async getMissingConfigValuesFromDefualt(): Promise<Set<string>> {
    const missing = new Set<string>();
    this.defaultConfig = JSON5.parse(
      await FileHelper.readAsString("config/default.json5")
    );

    const parseMissing = (config: unknown, path: string) => {
      if (typeof config === "object") {
        for (const [key, value] of Object.entries(config)) {
          // Recurse to get nested config values
          parseMissing(value, `${path}.${key}`);
        }
      } else {
        // If we reached this it means it's a leaf node with a primitive value
        if (isNothingOrZero(config)) {
          missing.add(path.slice(1));
        }
      }
    };
    parseMissing(this.defaultConfig, "");
    return missing;
  }

  private async configureTelegram() {
    const token = c.has("notifier.telegram.token")
      ? c.get<string>("notifier.telegram.token")
      : "";
    const recipientChatId = c.has("notifier.telegram.recipientChatId")
      ? c.get<string>("notifier.telegram.recipientChatId")
      : "";

    if (!token) {
      Logger.log(
        "➡️  [👾Booter][configureTelegram()] Bot token not found, please create a Telegram bot and enter the token below:"
      );
      await inquirer
        .prompt([
          {
            name: "notifier.telegram.token",
            message: "Enter a value for notifier.telegram.token:",
          },
        ])
        .then((answers) => {
          _.merge(this.inputConfig, answers);
        });
    } else {
      _.merge(this.inputConfig, { notfier: { telegram: token } });
    }

    if (recipientChatId) {
      Logger.log(
        "✅ [👾Booter][configureTelegram()] Telegram config looks good"
      );
      return;
    }
    Logger.log(
      "🔄 [👾Booter][configureTelegram()] Starting up Telegram bot with provided token... use /id to get your recipientChatId"
    );
    const gram = new Telegram(
      _.get(this.inputConfig, "notifier.telegram.token")
    );
    gram.start();

    await inquirer
      .prompt([
        {
          name: "notifier.telegram.recipientChatId",
          message: "Enter a value for notifier.telegram.recipientChatId:",
        },
      ])
      .then((answers) => {
        _.merge(this.inputConfig, answers);
      });
    await gram.stop();
    Logger.log("✅ [👾Booter][configureTelegram()] Telegram config completed");
  }

  private async configWizard() {
    const missingFromDefualt = await this.getMissingConfigValuesFromDefualt();
    const shouldConfigureTelegram =
      missingFromDefualt.has("notifier.telegram.token") ||
      missingFromDefualt.has("notifier.telegram.recipientChatId");

    if (shouldConfigureTelegram) {
      await this.configureTelegram();
      missingFromDefualt.delete("notifier.telegram.token");
      missingFromDefualt.delete("notifier.telegram.recipientChatId");
    }

    const prompts = [];
    missingFromDefualt.forEach(async (key) => {
      if (!c.has(key) || isNothingOrZero(c.get(key))) {
        prompts.push({
          name: key,
          message: `Enter a value for ${key}:`,
        });
      }
    });

    await inquirer.prompt(prompts).then((answers) => {
      _.merge(this.inputConfig, answers);
    });

    prompts.length > 0 && (await this.saveConfigFile());
    Logger.log("✅ [👾Booter][configWizard()] configuration completed.");
    return;
  }

  /**
   * Boot the app.
   *
   * Bootrspping scared ape includes:
   * - Adding missing configuration values
   * - Creating SQLite DB
   * - Running migrations
   * - Seeding database
   * - Initial data scrape run
   */
  async boot(opts: { initialScrape: boolean } = { initialScrape: true }) {
    Logger.log("🔄 [👾Booter][boot()] Booting scared-ape...");
    await this.configWizard();
    await this.db.connect();
    await this.db.migrate();
    const seeder = new Seeder(this.db);
    await seeder.seed();
    if (opts.initialScrape) {
      // Run all the active scrapers
      Logger.log("🔄 [👾Booter][boot()] Starting active scrapers...");
      const activeScrapers = await this.db.getActiveScrapers();
      await Promise.all(
        activeScrapers.map((scraper) => this.runScraper(scraper.name))
      );
      Logger.log("✅ [👾Booter][boot()] All active scrapers finished running.");
    }
    Logger.log("✅ [👾Booter][boot()] Successfully booted scared-ape.");
  }
}
