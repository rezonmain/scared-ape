import type { DB } from "../services/db/DB.js";
import type { Scheduler } from "../services/scheduler/Scheduler.js";
import type { Cache } from "../services/cache/Cache.js";
import type { Mailer } from "../services/mailer/Mailer.js";
import type { Auth } from "../services/auth/Auth.js";

declare global {
  namespace Express {
    interface Request {
      ctx: {
        db: DB;
        scheduler: Scheduler;
        cache: Cache;
        mailer: Mailer;
        auth: Auth;
      };
    }
  }
}
