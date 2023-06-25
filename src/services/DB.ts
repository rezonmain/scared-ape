import { AccessRequest } from "../models/AccessRequest.js";
import { Json } from "../models/Json.js";
import { Run } from "../models/Run.js";
import { Scraper } from "../models/Scraper.js";
import { Screenshot } from "../models/Screenshot.js";
import config from "config";

/**
 * The database service, this is the interface that all database services should implement.
 */
export abstract class DB {
  readonly name: string;
  constructor() {
    this.name = config.get("database.name");
  }
  /**
   * Connects to the database.
   */
  abstract connect(): Promise<void>;

  /**
   * Migrates the database to the latest version.
   */
  abstract migrate(): Promise<void>;

  /**
   * Disconnects from the database.
   */
  abstract disconnect(): Promise<void>;

  /**
   * Saves the serialized JSON formatted as the corresponding DTO to the database.
   * @param scraperKnownId
   * @param serializedJSON
   */
  abstract saveScrappedJSON(
    scraperKnownId: Scraper["knownId"],
    serializedJSON: Json["json"]
  ): Promise<void>;

  /**
   * Get the latest serialized JSON from a scrape run, formatted as the corresponding DTO from the database.
   * @param scraperKnownId
   */
  abstract getScrappedJSON(scraperKnownId: Scraper["knownId"]): Promise<Json>;

  /**
   * Get the serialized JSON from a scrape run, using its ID
   * @param jsonId
   */
  abstract getScrappedJSONById(jsonId: Json["id"]): Promise<Json>;

  /**
   * Get the serialized JSON from a scrape run, using its runID
   * @param jsonId
   */
  abstract getScrappedJSONByRunId(runId: Run["id"]): Promise<Json>;

  /**
   * Save the screenshot of the scraped page to the database.
   * @param scraperKnownId
   * @param base64Image
   */
  abstract savePageScreenshot(
    scraperKnownId: Scraper["knownId"],
    base64Image: Screenshot["image"]
  ): Promise<void>;

  /**
   * Get the latest screenshot of the scraped page from the database.
   * @param scraperKnownId
   */
  abstract getPageScreenshot(
    scraperKnownId: Scraper["knownId"]
  ): Promise<Screenshot>;

  /**
   * Get a screenshot from a scrape run, using its ID
   * @param scraperKnownId
   */
  abstract getPageScreenshotById(
    screenshotId: Screenshot["id"]
  ): Promise<Screenshot>;

  /**
   * Get a screenshot from a scrape run, using its run ID
   * @param scraperKnownId
   */
  abstract getPageScreenshotByRunId(runId: Run["id"]): Promise<Screenshot>;

  /**
   * Save a scrape run metadata to the database.
   * @param scraperKnownId
   * @param runId
   */
  abstract saveScrapeRun(scraperKnownId: Scraper["knownId"]): Promise<void>;

  /**
   * Get the latest scrape run of the passed scraperKnownId.
   * @param scraperKnownId
   * @param runId
   */
  abstract getScrapeRun(scraperKnownId: Scraper["knownId"]): Promise<Run>;

  /**
   * Update the status of a scrape run.
   * @param scraperKnownId
   * @param runId
   * @param status
   */
  abstract updateScrapeRunStatus(
    scraperKnownId: Scraper["knownId"],
    runId: Run["id"],
    status: Run["status"]
  ): Promise<void>;

  /**
   * Save an access request to the database.
   * @param email
   */
  abstract saveAccessRequest(email: AccessRequest["email"]): Promise<void>;

  /**
   * Update an access request to the database, this method should
   * ONLY be called by someone with 'pyro' role.
   * @param email
   * @param whitelisted
   */
  abstract updateAccessRequest(
    email: AccessRequest["email"],
    whitelisted: AccessRequest["whitelisted"]
  ): Promise<void>;

  /**
   * Hard delete an access request from the database
   */
  abstract deleteAccessRequest(email: AccessRequest["email"]): Promise<void>;
}

/**
 * v1
```DBML
Table run {
  id integer [primary key]
  createdAt timestamp [not null]
  updatedAt timestamp [not null]
  scraperId integer
  status text [not null, default: 'running']
}

Table scraper {
  id integer [primary key]
  createdAt timestamp [not null]
  updatedAt timestamp [not null]
  knownId text [not null, unique]
  name text [not null]
  associatedWidgets text [not null]
}

Table json {
  id integer [primary key]
  createdAt timestamp [not null]
  updatedAt timestamp [not null]
  scraperId integer
  runId integer
  json text
  cacheHash text
  status text [not null, default: 'latest']
}

Table user {
  id integer [primary key]
  createdAt timestamp [not null]
  updatedAt timestamp [not null]
  email text [not null, unique]
  role text [not null, default: 'scout']
}

Table screenshot {
  id integer [primary key]
  createdAt timestamp [not null]
  updatedAt timestamp [not null]
  scraperId integer
  runId integer
  image text
}

Table access_request {
  id integer [primary key]
  createdAt timestamp [not null]
  updatedAt timestamp [not null]
  email text [not null, unique]
  whitelisted integer [not null, default: 0]
}

Table token {
  id integer [primary key]
  createdAt timestamp [not null]
  updatedAt timestamp [not null]
  userId integer
  token text [not null]
  expiresAt timestamp [not null]
}

Ref: run.scraperId > scraper.id
Ref: json.scraperId > scraper.id
Ref: screenshot.scraperId > scraper.id
Ref: screenshot.runId > run.id
Ref: token.userId > user.id
```
*/
