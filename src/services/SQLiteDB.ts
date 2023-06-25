import { AccessRequest } from "../models/AccessRequest.js";
import { Json } from "../models/Json.js";
import { Run } from "../models/Run.js";
import { Scraper } from "../models/Scraper.js";
import { Screenshot } from "../models/Screenshot.js";
import { MigrationsHelper } from "../utils/MigrationsHelper.js";
import { DB } from "./DB.js";
import sqlite3 from "sqlite3";

export class SQLiteDB extends DB {
  private db: sqlite3.Database;

  constructor() {
    super();
  }

  async connect(): Promise<void> {
    this.db = new sqlite3.Database(`./${this.name}.sqlite`, (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log("Succesfully connected to the scared-ape database.");
    });
  }

  async migrate(): Promise<void> {
    const migrations = await MigrationsHelper.getAll();
    console.log(JSON.stringify(migrations, null, 2));
  }

  async disconnect(): Promise<void> {
    this.db.close((err) => {
      if (err) {
        console.error(err.message);
      }
      console.log("Closed the database connection.");
    });
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
