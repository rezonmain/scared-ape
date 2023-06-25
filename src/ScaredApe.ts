import { Browser } from "puppeteer";
import { DB } from "./services/DB.js";
import { SQLiteDB } from "./services/SQLiteDB.js";
import { Seeder } from "./services/Seeder.js";

export class ScaredApe {
  private db: DB;
  private api;
  private scheduler;
  constructor() {
    this.db = new SQLiteDB();
  }

  async bootstrap() {
    await this.db.connect();
    await this.db.migrate();
    const seeder = new Seeder(this.db);
    await seeder.seed();
    await this.db.disconnect();
  }

  async run() {
    return undefined;
  }
}
