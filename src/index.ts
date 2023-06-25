import { SQLiteDB } from "./services/SQLiteDB.js";
import { Seeder } from "./services/Seeder.js";

(async () => {
  const db = new SQLiteDB();
  await db.connect();
  await db.migrate();
  const seeder = new Seeder(db);
  await seeder.seed();
  await db.disconnect();
})();
