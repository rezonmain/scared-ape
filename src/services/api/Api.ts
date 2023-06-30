import config from "config";
import express from "express";
import type { DB } from "../db/DB.js";
import type { Scheduler } from "../scheduler/Scheduler.js";
import type { Cache } from "../cache/Cache.js";
import { Logger } from "../../utils/Logger.js";
import { scraperRouter } from "./routes/scraper.js";
import { runRouter } from "./routes/run.js";
import { jobRouter } from "./routes/job.js";
import { Service } from "../Service.js";

export class Api extends Service {
  private ex: express.Express;
  private port: number;
  constructor(
    private db: DB,
    private scheduler: Scheduler,
    private cache: Cache
  ) {
    super();
    this.ex = express();
    this.port = config.get("api.port");
  }

  start() {
    // Attach services to the request context
    this.ex.use((req, _, next) => {
      req.ctx = {
        db: this.db,
        scheduler: this.scheduler,
        cache: this.cache,
      };
      next();
    });

    this.ex.use("/scraper", scraperRouter);
    this.ex.use("/run", runRouter);
    this.ex.use("/job", jobRouter);

    this.ex.get("/", async (req, res) => {
      res.send("Hello World!");
    });

    this.ex.listen(this.port, () => {
      Logger.log(`✅ [🚀Api][start()] Listening on port ${this.port}`);
    });
    this.running = true;
  }
}
