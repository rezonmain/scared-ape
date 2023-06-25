import { SQLiteDB } from "./services/SQLiteDB.js";

(async () => {
  const db = new SQLiteDB();
  await db.connect();
  await db.migrate();
  await db.disconnect();
})();
