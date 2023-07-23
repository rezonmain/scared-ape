import type { DB } from "./services/db/DB.js";
import { SQLiteDB } from "./services/db/SQLiteDB.js";
import { Cache } from "./services/cache/Cache.js";
import { Scheduler } from "./services/scheduler/Scheduler.js";
import { Api } from "./services/api/Api.js";
import { Telegram } from "./services/notifier/Telegram/Telegram.js";
import { Fetcher } from "./services/Fetcher.js";
import { Peta } from "./services/Peta.js";
import { Mailer } from "./services/mailer/Mailer.js";
import { Auth } from "./services/auth/Auth.js";

/**
 * The main app class
 */
export class ScaredApe {
  private db: DB;
  private api: Api;
  private scheduler: Scheduler;
  private cache: Cache;
  private notifier: Telegram;
  private fetcher: Fetcher;
  private peta: Peta;
  private mailer: Mailer;
  private auth: Auth;
  constructor() {
    this.db = new SQLiteDB();
    this.cache = new Cache();
    this.mailer = new Mailer();
    this.auth = new Auth(this.db);
    this.notifier = new Telegram();
    this.fetcher = new Fetcher(this.cache);
    this.api = new Api(
      this.db,
      this.scheduler,
      this.cache,
      this.mailer,
      this.auth
    );
    this.peta = new Peta(this.db, this.api, this.cache, this.notifier);
    this.scheduler = new Scheduler(this.db, this.notifier, this.peta);
  }

  /**
   * Run the app
   * - Connect to the database
   * - Start the scheduler
   * - Start the notifier
   * - Start the api
   */
  async run() {
    this.db.connect();
    this.scheduler.start();
    this.notifier.start();
    this.api.start();
  }
}
