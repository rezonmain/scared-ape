import { AccessRequest } from "../models/AccessRequest.js";
import { Json } from "../models/Json.js";
import { Run } from "../models/Run.js";
import { Scraper } from "../models/Scraper.js";
import { Screenshot } from "../models/Screenshot.js";
import { MigrationsHelper } from "../utils/MigrationsHelper.js";
import { DB } from "./DB.js";
import Database from "better-sqlite3";

export class SQLiteDB extends DB {
  private db: Database.Database;

  constructor() {
    super();
  }

  async connect(): Promise<void> {
    try {
      this.db = new Database(`./${this.name}.sqlite`);
      console.log(`✅ Connected to the ${this.name} database`);
    } catch (error) {
      console.error(error);
    }
  }

  async migrate(): Promise<void> {
    const migrations = await MigrationsHelper.getAll();
    const currentVersion = await this.getMigrationVersion();
    // Loop over all migrations
    for (const migration of migrations) {
      // If the migration version is less than or equal to the current version, skip it
      if (migration.version <= currentVersion) {
        console.log(
          `⏭️ Skipping migration: ${migration.name} version: ${migration.version}`
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
        console.error(
          `Error running migration ${migration.name} rolling back transaction...`,
          "\n",
          error
        );
        throw error;
      }
      console.log(
        `✅ OK Migration: ${migration.name}, version: ${migration.version}`
      );
    }
    console.log("✅ Successfully ran all migrations");
  }

  async disconnect(): Promise<void> {
    try {
      this.db.close();
      console.log(`✅ Disconnected from the ${this.name} database`);
    } catch (error) {
      console.error(error);
    }
  }

  async getMigrationVersion(): Promise<number> {
    return this.db.pragma("user_version", { simple: true }) as number;
  }

  saveScrappedJSON(
    scraperKnownId: Scraper["knownId"],
    serializedJSON: Json["json"]
  ): Promise<void> {
    throw new Error("Method not implemented");
  }

  getScrappedJSON(scraperKnownId: Scraper["knownId"]): Promise<Json> {
    throw new Error("Method not implemented");
  }

  getScrappedJSONById(jsonId: Json["id"]): Promise<Json> {
    throw new Error("Method not implemented");
  }

  getScrappedJSONByRunId(runId: Run["id"]): Promise<Json> {
    throw new Error("Method not implemented");
  }

  savePageScreenshot(
    scraperKnownId: Scraper["knownId"],
    base64Image: Screenshot["image"]
  ): Promise<void> {
    throw new Error("Method not implemented");
  }

  getPageScreenshot(scraperKnownId: Scraper["knownId"]): Promise<Screenshot> {
    throw new Error("Method not implemented");
  }

  getPageScreenshotById(screenshotId: Screenshot["id"]): Promise<Screenshot> {
    throw new Error("Method not implemented");
  }

  getPageScreenshotByRunId(runId: Run["id"]): Promise<Screenshot> {
    throw new Error("Method not implemented");
  }

  saveScrapeRun(scraperKnownId: Scraper["knownId"]): Promise<void> {
    throw new Error("Method not implemented");
  }

  getScrapeRun(scraperKnownId: Scraper["knownId"]): Promise<Run> {
    throw new Error("Method not implemented");
  }

  updateScrapeRunStatus(
    scraperKnownId: Scraper["knownId"],
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
