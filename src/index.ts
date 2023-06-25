import { SQLiteDB } from "./services/SQLiteDB.js";

(async () => {
  const db = new SQLiteDB();
  await db.connect();
  try {
    await db.migrate();
  } catch {
    console.error("😤 Unable to run migrations, exiting 😤");
    process.exit(1);
  }
  await db.disconnect();
})();
