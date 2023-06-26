import { AccessRequest } from "../../models/AccessRequest.js";
import { Json } from "../../models/Json.js";
import { Run } from "../../models/Run.js";
import { IScraper } from "../../models/Scraper.js";
import { Screenshot } from "../../models/Screenshot.js";
import { MigrationsHelper } from "../../utils/MigrationsHelper.js";
import { DB } from "./DB.js";
import Database from "better-sqlite3";
import { User } from "../../models/User.js";
import { Logger } from "../../utils/Logger.js";

export class SQLiteDB extends DB {
  private db: Database.Database;

  constructor() {
    super();
  }

  async connect(): Promise<void> {
    try {
      this.db = new Database(`./${this.name}.sqlite`);
      Logger.log(`✅ Connected to the ${this.name} database`);
    } catch (error) {
      Logger.error(error);
    }
  }

  async migrate(): Promise<void> {
    Logger.log(`🔄 [💾SQLite ${this.name}][migrate()] Running migrations...`);
    const migrations = await MigrationsHelper.getAll();
    const currentVersion = await this.getMigrationVersion();
    // Loop over all migrations
    for (const migration of migrations) {
      // If the migration version is less than or equal to the current version, skip it
      if (migration.version <= currentVersion) {
        Logger.log(
          `⏭️  [💾SQLite ${this.name}][migrate()] Skipping migration: ${migration.name} version: ${migration.version}`
        );
        continue;
      }
      /* 
        Run all SQL statements in the migration in a 
        transaction to safeguard against partial migrations
      */
      try {
        this.db.transaction(() => {
          migration.content.forEach((sql) => {
            this.db.prepare(sql).run();
          });
        })();
      } catch (error) {
        Logger.error(
          `❌ [💾SQLite ${this.name}][migrate()] Error running migration ${migration.name} rolling back transaction...`,
          "\n",
          error
        );
        Logger.logAndExit("😤 Unable to run migrations 😤");
      }
      Logger.log(
        `🔄 [💾SQLite ${this.name}][migrate()] OK Migration: ${migration.name}, version: ${migration.version}`
      );
    }
    Logger.log(
      `✅ [💾SQLite ${this.name}][migrate()] Successfully ran all migrations`
    );
  }

  async disconnect(): Promise<void> {
    try {
      this.db.close();
      Logger.log(
        `✅ [💾SQLite ${this.name}][disconnect()] Disconnected from the ${this.name} database`
      );
    } catch (error) {
      Logger.error(error);
    }
  }

  async registerScraper(scraper: IScraper): Promise<void> {
    throw new Error("Method not correctly implemented.");
    const query =
      "INSERT INTO scraper (knownId, name, associatedWidgets) VALUES (?, ?, ?)";
    try {
      this.db
        .prepare(query)
        .run(
          scraper.knownId,
          scraper.name,
          scraper.associatedWidgets.join(",")
        );
      Logger.log(
        `✅ [💾SQLite ${this.name}][registerScraper()] Query -> ${query} with ${
          scraper.knownId
        }, ${scraper.name}, ${scraper.associatedWidgets.join(",")}`
      );
    } catch (error) {
      Logger.error(error);
    }
  }

  async registerManyScrapers(scrapers: IScraper[]): Promise<void> {
    const query =
      "INSERT INTO scraper (name, status, knownId, shouldNotifyChanges, associatedWidgets) VALUES (?, ?, ?, ?, ?)";
    const stmt = this.db.prepare(query);
    const insertMany = this.db.transaction(() => {
      scrapers.forEach((scraper) => {
        stmt.run(
          scraper.name,
          scraper.status,
          scraper.knownId,
          scraper.shouldNotifyChanges ? 1 : 0,
          scraper.associatedWidgets.join(",")
        );
        Logger.log(
          `✅ [💾SQLite ${
            this.name
          }][registerManyScrapers()] Query -> ${query} with ${Object.values(
            scraper
          ).join(", ")}`
        );
      });
    });
    try {
      insertMany();
    } catch (error) {
      Logger.error(error);
    }
  }

  async getScraperbyKnownId(
    knownId: IScraper["knownId"]
  ): Promise<IScraper | undefined> {
    const query = "SELECT * FROM scraper WHERE knownId = ?";
    try {
      const scraper = this.db.prepare(query).get(knownId);
      Logger.log(
        `✅ [💾SQLite ${this.name}][getScraperbyKnownId()] Query -> ${query} with knownId: ${knownId}`
      );
      return scraper ? (scraper as IScraper) : undefined;
    } catch (error) {
      Logger.error(error);
    }
  }

  async getAllScrapers(): Promise<IScraper[]> {
    const query = "SELECT * FROM scraper";
    try {
      const scrapers = this.db.prepare(query).all() as IScraper[];
      Logger.log(
        `✅ [💾SQLite ${this.name}][getAllScrapers()] Query -> ${query}`
      );
      return scrapers;
    } catch (error) {
      Logger.error(error);
    }
  }

  async getActiveScrapers(): Promise<IScraper[]> {
    const query = "SELECT * FROM scraper WHERE status = 'active'";
    try {
      const scrapers = this.db.prepare(query).all() as IScraper[];
      Logger.log(
        `✅ [💾SQLite ${this.name}][getActiveScrapers()] Query -> ${query}`
      );
      return scrapers;
    } catch (error) {
      Logger.error(error);
    }
  }

  async retireScraper(knownId: IScraper["knownId"]): Promise<void> {
    throw new Error("Method not implemented");
  }

  async getMigrationVersion(): Promise<number> {
    return this.db.pragma("user_version", { simple: true }) as number;
  }

  async saveJson(
    scraperKnownId: IScraper["knownId"],
    json: Omit<Json, "scraperId">
  ): Promise<void> {
    const query =
      "INSERT INTO json (scraperId, json, cacheHash, runId) VALUES (?, ?, ?, ?)";
    try {
      const scraper = await this.getScraperbyKnownId(scraperKnownId);
      this.db
        .prepare(query)
        .run(scraper.id, json.json, json.cacheHash, json.runId);
      Logger.log(
        `✅ [💾SQLite ${this.name}][saveJson()] Query -> ${query} with ${scraper.id}, -, ${json.cacheHash}, ${json.runId}`
      );
    } catch (error) {
      Logger.error(error);
    }
  }

  async updateJson(json: Json): Promise<void> {
    const query = "UPDATE json SET status = ? WHERE id = ?";
    try {
      this.db.prepare(query).run(json.status, json.id);
      Logger.log(
        `✅ [💾SQLite ${this.name}][upateJson()] Query -> ${query} with ${json.status}, ${json.id}`
      );
    } catch (error) {
      Logger.error(error);
    }
  }

  async getLatestJsonHash(
    scraperKnownId: IScraper["knownId"]
  ): Promise<string | undefined> {
    const query =
      "SELECT cacheHash FROM json WHERE scraperId = ? ORDER BY id DESC LIMIT 1";
    try {
      const scraper = await this.getScraperbyKnownId(scraperKnownId);
      const res = this.db.prepare(query).get(scraper.id) as
        | { cacheHash: string }
        | undefined;
      Logger.log(
        `✅ [💾SQLite ${this.name}][getLatestJsonHash()] Query -> ${query} with scraperId: ${scraper.id}`
      );
      return res ? res.cacheHash : undefined;
    } catch (error) {
      Logger.error(error);
    }
  }

  async getLatestJson(
    scraperKnownId: IScraper["knownId"]
  ): Promise<Json | undefined> {
    const query = "SELECT * FROM json WHERE scraperId = ? ORDER BY id DESC";
    try {
      const scraper = await this.getScraperbyKnownId(scraperKnownId);
      const json = this.db.prepare(query).get(scraper.id);
      Logger.log(
        `✅ [💾SQLite ${this.name}][getLatestJson()] Query -> ${query} with scraperId: ${scraper.id}`
      );
      return json ? (json as Json) : undefined;
    } catch (error) {
      Logger.error(error);
    }
  }

  getJsonById(jsonId: Json["id"]): Promise<Json> {
    throw new Error("Method not implemented");
  }

  getJsonByRunId(runId: Run["id"]): Promise<Json> {
    throw new Error("Method not implemented");
  }

  async saveScreenshot(
    runId: Run["id"],
    scraperKnownId: IScraper["knownId"],
    base64Image: Screenshot["image"]
  ): Promise<void> {
    const query =
      "INSERT INTO screenshot (runId, scraperId, image) VALUES (?, ?, ?)";
    try {
      const scraper = await this.getScraperbyKnownId(scraperKnownId);
      this.db.prepare(query).run(runId, scraper.id, base64Image);
      Logger.log(
        `✅ [💾SQLite ${this.name}][saveScreenshot()] Query -> ${query} with ${scraper.id}, -`
      );
    } catch (error) {
      Logger.error(error);
    }
  }

  getLatestScreenshot(
    scraperKnownId: IScraper["knownId"]
  ): Promise<Screenshot> {
    throw new Error("Method not implemented");
  }

  getScreenshotById(screenshotId: Screenshot["id"]): Promise<Screenshot> {
    throw new Error("Method not implemented");
  }

  getScreenshotByRunId(runId: Run["id"]): Promise<Screenshot> {
    throw new Error("Method not implemented");
  }

  async saveRun(scraperKnownId: IScraper["knownId"]): Promise<Run["id"]> {
    const query = "INSERT INTO run (scraperId) VALUES (?)";
    try {
      const scraper = await this.getScraperbyKnownId(scraperKnownId);
      const res = this.db.prepare(query).run(scraper.id);
      Logger.log(
        `✅ [💾SQLite ${this.name}][saveRun()] Query -> ${query} with ${scraper.id}`
      );
      return res.lastInsertRowid;
    } catch (error) {
      Logger.error(error);
    }
  }

  getLatestRun(scraperKnownId: IScraper["knownId"]): Promise<Run> {
    throw new Error("Method not implemented");
  }

  async updateRunStatus(
    runId: Run["id"],
    status: Run["status"]
  ): Promise<void> {
    const query = "UPDATE run SET status = ? WHERE id = ?";
    try {
      this.db.prepare(query).run(status, runId);
      Logger.log(
        `✅ [💾SQLite ${this.name}][updateRunStatus()] Query -> ${query} with ${status}, ${runId}`
      );
    } catch (error) {
      Logger.error(error);
    }
  }

  async saveUser(user: User): Promise<void> {
    const query = "INSERT INTO user (email, role) VALUES (@email, @role)";
    try {
      this.db.prepare(query).run(user);
      Logger.log(
        `✅ [💾SQLite ${this.name}][saveUser()] Query -> ${query} with ${user.email}, ${user.role}`
      );
    } catch (error) {
      Logger.error(error);
    }
  }

  async getUser(email: string): Promise<User | undefined> {
    const query = "SELECT * FROM user WHERE email = ?";
    try {
      const user = this.db.prepare(query).get(email);
      Logger.log(
        `✅ [💾SQLite ${this.name}][getUser()] Query -> ${query} with ${email}`
      );
      return user ? (user as User) : undefined;
    } catch (error) {
      Logger.error(error);
    }
  }

  saveAccessRequest(email: AccessRequest["email"]): Promise<void> {
    throw new Error("Method not implemented");
  }

  updateAccessRequest(
    email: AccessRequest["email"],
    whitelisted: AccessRequest["whitelisted"]
  ): Promise<void> {
    throw new Error("Method not implemented");
  }

  deleteAccessRequest(email: AccessRequest["email"]): Promise<void> {
    throw new Error("Method not implemented");
  }
}
