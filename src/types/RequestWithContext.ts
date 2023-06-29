import type { DB } from "../services/db/DB.js";
import type { Scheduler } from "../services/scheduler/Scheduler.js";
import type { Cache } from "../services/cache/Cache.js";

declare global {
  namespace Express {
    interface Request {
      ctx: {
        db: DB;
        scheduler: Scheduler;
        cache: Cache;
      };
    }
  }
}
