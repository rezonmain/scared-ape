import { Seeder } from "../services/Seeder.js";
import { SQLiteDB } from "../services/db/SQLiteDB.js";
import { Logger } from "../utils/Logger.js";

(async () => {
  try {
    Logger.log("🔄 [👾cli/bootstrap] bootstrapping scared-ape...");
    const db = new SQLiteDB();
    await db.connect();
    await db.migrate();
    const seeder = new Seeder(db);
    await seeder.seed();
    await db.disconnect();
    Logger.log("✅ [👾cli/bootstrap] successfully bootrsrapped scared-ape...");
  } catch (error) {
    Logger.logAndExit(
      `❌ [👾cli/bootstrap] something went wrong while bootstrapping, ${error}`
    );
  }
})();
