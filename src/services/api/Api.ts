import config from "config";
import express from "express";
import { Logger } from "../../utils/Logger.js";
import type { DB } from "../db/DB.js";
import type { Scheduler } from "../scheduler/Scheduler.js";

export class Api {
  private ex: express.Express;
  private port: number;
  constructor(private db: DB, private scheduler: Scheduler) {
    this.ex = express();
    this.port = config.get("api.port");
  }

  start() {
    this.ex.get("/", async (req, res) => {
      res.send("Hello World!");
    });

    this.ex.get("/scrapers", async (req, res) => {
      const activeScrapers = await this.db.getActiveScrapers();
      res.send(JSON.stringify(activeScrapers, null, 2));
    });

    this.ex.get("/jobs", async (req, res) => {
      const jobs = this.scheduler.jobs;
      res.send(
        JSON.stringify(
          jobs.map((j) => ({
            name: j.id,
            status: j.getStatus(),
          })),
          null,
          2
        )
      );
    });

    this.ex.listen(this.port, () => {
      Logger.log(`✅ [🚀Api][start()] Listening on port ${this.port}`);
    });
  }
}
