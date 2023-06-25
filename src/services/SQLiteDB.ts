import { AccessRequest } from "../models/AccessRequest.js";
import { Json } from "../models/Json.js";
import { Run } from "../models/Run.js";
import { IScraper } from "../models/Scraper.js";
import { Screenshot } from "../models/Screenshot.js";
import { MigrationsHelper } from "../utils/MigrationsHelper.js";
import { DB } from "./DB.js";
import Database from "better-sqlite3";
import { User } from "../models/User.js";
import { Logger } from "../utils/Logger.js";

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
    const migrations = await MigrationsHelper.getAll();
    const currentVersion = await this.getMigrationVersion();
    // Loop over all migrations
    for (const migration of migrations) {
      // If the migration version is less than or equal to the current version, skip it
      if (migration.version <= currentVersion) {
        Logger.log(
          `⏭️  [SQLite ${this.name}] Skipping migration: ${migration.name} version: ${migration.version}`
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
          `❌ [SQLite ${this.name}] Error running migration ${migration.name} rolling back transaction...`,
          "\n",
          error
        );
        Logger.logAndExit("😤 Unable to run migrations 😤");
      }
      Logger.log(
        `✅ [SQLite ${this.name}] OK Migration: ${migration.name}, version: ${migration.version}`
      );
    }
    Logger.log(`✅ [SQLite ${this.name}] Successfully ran all migrations`);
  }

  async disconnect(): Promise<void> {
    try {
      this.db.close();
      Logger.log(
        `✅ [SQLite ${this.name}] Disconnected from the ${this.name} database`
      );
    } catch (error) {
      Logger.error(error);
    }
  }

  async registerScraper(scraper: IScraper): Promise<void> {
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
        `✅ [SQLite ${this.name}] Query -> ${query} with ${scraper.knownId}, ${
          scraper.name
        }, ${scraper.associatedWidgets.join(",")}`
      );
    } catch (error) {
      Logger.error(error);
    }
  }

  async registerManyScrapers(scrapers: IScraper[]): Promise<void> {
    const query =
      "INSERT INTO scraper (name, status, knownId, associatedWidgets) VALUES (?, ?, ?, ?)";
    const stmt = this.db.prepare(query);
    const insertMany = this.db.transaction(() => {
      scrapers.forEach((scraper) => {
        stmt.run(
          scraper.name,
          scraper.status,
          scraper.knownId,
          scraper.associatedWidgets.join(",")
        );
        Logger.log(
          `✅ [SQLite ${this.name}] Query -> ${query} with ${Object.values(
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
        `✅ [SQLite ${this.name}] Query -> ${query} with knownId: ${knownId}`
      );
      return scraper ? (scraper as IScraper) : undefined;
    } catch (error) {
      Logger.error(error);
    }
  }

  async getAllScrapers(): Promise<IScraper[]> {
    try {
      const scrapers = this.db
        .prepare("SELECT * FROM scraper")
        .all() as IScraper[];
      return scrapers;
    } catch (error) {
      Logger.error(error);
    }
  }

  async getActiveScrapers(): Promise<IScraper[]> {
    try {
      const scrapers = this.db
        .prepare("SELECT * FROM scraper WHERE status = 'active'")
        .all() as IScraper[];
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

  saveScrappedJSON(
    scraperKnownId: IScraper["knownId"],
    serializedJSON: Json["json"]
  ): Promise<void> {
    throw new Error("Method not implemented");
  }

  getScrappedJSON(scraperKnownId: IScraper["knownId"]): Promise<Json> {
    throw new Error("Method not implemented");
  }

  getScrappedJSONById(jsonId: Json["id"]): Promise<Json> {
    throw new Error("Method not implemented");
  }

  getScrappedJSONByRunId(runId: Run["id"]): Promise<Json> {
    throw new Error("Method not implemented");
  }

  savePageScreenshot(
    scraperKnownId: IScraper["knownId"],
    base64Image: Screenshot["image"]
  ): Promise<void> {
    throw new Error("Method not implemented");
  }

  getPageScreenshot(scraperKnownId: IScraper["knownId"]): Promise<Screenshot> {
    throw new Error("Method not implemented");
  }

  getPageScreenshotById(screenshotId: Screenshot["id"]): Promise<Screenshot> {
    throw new Error("Method not implemented");
  }

  getPageScreenshotByRunId(runId: Run["id"]): Promise<Screenshot> {
    throw new Error("Method not implemented");
  }

  saveScrapeRun(scraperKnownId: IScraper["knownId"]): Promise<void> {
    throw new Error("Method not implemented");
  }

  getScrapeRun(scraperKnownId: IScraper["knownId"]): Promise<Run> {
    throw new Error("Method not implemented");
  }

  async saveUser(user: User): Promise<void> {
    const query = "INSERT INTO user (email, role) VALUES (@email, @role)";
    try {
      this.db.prepare(query).run(user);
      Logger.log(
        `✅ [SQLite ${this.name}] Query -> ${query} with ${user.email}, ${user.role}`
      );
    } catch (error) {
      Logger.error(error);
    }
  }

  async getUser(email: string): Promise<User | undefined> {
    const query = "SELECT * FROM user WHERE email = ?";
    try {
      const user = this.db.prepare(query).get(email);
      Logger.log(`✅ [SQLite ${this.name}] Query -> ${query} with ${email}`);
      return user ? (user as User) : undefined;
    } catch (error) {
      Logger.error(error);
    }
  }

  updateScrapeRunStatus(
    scraperKnownId: IScraper["knownId"],
    runId: Run["id"],
    status: Run["status"]
  ): Promise<void> {
    throw new Error("Method not implemented");
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
