import config from "config";
import express from "express";
import helmet from "helmet";
import type { DB } from "../db/DB.js";
import type { Scheduler } from "../scheduler/Scheduler.js";
import type { Cache } from "../cache/Cache.js";
import { Logger } from "../../utils/Logger.js";
import { scraperRouter } from "./routes/scraper.js";
import { runRouter } from "./routes/run.js";
import { jobRouter } from "./routes/job.js";
import { Service } from "../Service.js";
import type { Mailer } from "../mailer/Mailer.js";
import type { Auth } from "../auth/Auth.js";
import { authRouter } from "./routes/auth.js";
import { HomeDto } from "./dto/api.dto.js";
import { log } from "./log.middleware.js";
import { cors } from "./cors.middleware.js";
import { generalLimiter } from "./limiter.middleware.js";
import { accessRequestRouter } from "./routes/access-request.js";

export class Api extends Service {
  private ex: express.Express;
  private port: number | string;
  private services: Service[] = [];
  constructor(
    private db: DB,
    private scheduler: Scheduler,
    private cache: Cache,
    private mailer: Mailer,
    private auth: Auth
  ) {
    super();
    this.ex = express();
    this.port = process.env.PORT ?? config.get("api.port");
    this.services = [this.db, this.scheduler, this.cache, this.mailer];
  }

  start() {
    // Attach services to the request context
    this.ex.use((req, _, next) => {
      req.ctx = {
        db: this.db,
        scheduler: this.scheduler,
        cache: this.cache,
        mailer: this.mailer,
        auth: this.auth,
        services: this.services,
      };
      next();
    });

    this.ex.use(cors);
    this.ex.use(helmet());
    this.ex.use(log);
    this.ex.use(generalLimiter);
    this.ex.use("/scraper", scraperRouter);
    this.ex.use("/run", runRouter);
    this.ex.use("/job", jobRouter);
    this.ex.use("/auth", authRouter);
    this.ex.use("/access-request", accessRequestRouter);

    this.ex.get("/", async (_, res) => {
      const json = new HomeDto({ greet: "Hello World!" });
      res.json(json);
    });

    this.ex.listen(this.port, () => {
      Logger.log(`✅ [🚀Api][start()] Listening on port ${this.port}`);
    });
    this.running = true;
  }

  get name() {
    return "express-api";
  }
}
