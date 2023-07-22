import type { DB } from "./db/DB.js";
import { ScrapersHelper } from "../utils/ScrapersHelper.js";
import { Logger } from "../utils/Logger.js";

export class Seeder {
  constructor(private db: DB) {}
  async seed() {
    Logger.log("🔄 [🌱Seeder] Seeding database...");
    try {
      await this.createPyro();
      await this.createNotWhitelisted();
      await this.registerScrapers();
      Logger.log("✅ [🌱Seeder] Database successfully seeded!");
    } catch (error) {
      Logger.logAndExit("😤 Unable to seed database, exiting 😤", error);
    }
  }

  private async createPyro() {
    const email = process.env.PYRO;
    const pyro = await this.db.getUser(email);
    if (pyro) {
      Logger.log("✅ [🌱Seeder] pyro user already exists in database");
      return;
    }
    this.db.saveUser({ email, role: "pyro", whitelist: true });
  }

  private async createNotWhitelisted() {
    const email = "notwhitelisted@test.com";
    const pyro = await this.db.getUser(email);
    if (pyro) {
      Logger.log(
        "✅ [🌱Seeder] not whitelisted user already exists in database"
      );
      return;
    }
    this.db.saveUser({ email, role: "demoman", whitelist: false });
  }

  private async registerScrapers() {
    const registeredScrapers = await this.db.getAllScrapers();
    const scrapers = await ScrapersHelper.getAll();
    const idList = ScrapersHelper.toKnownIdList(registeredScrapers);
    const missingScrapers = scrapers
      .filter((s) => !idList.includes(s.knownId))
      .map((s) => ({ ...s.model }));

    if (missingScrapers.length <= 0) return;
    Logger.log(
      "🔄 [🌱Seeder] Registering scrapers:",
      ...ScrapersHelper.toKnownIdList(missingScrapers)
    );
    await this.db.registerManyScrapers(missingScrapers);
  }
}
