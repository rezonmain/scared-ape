import { ScaredApe } from "../ScaredApe.js";
import { Logger } from "../utils/Logger.js";

(async () => {
  try {
    Logger.log("🔄 [👾cli/bootstrap] bootstrapping scared-ape...");
    const app = new ScaredApe();
    await app.bootstrap();
    Logger.log("✅ [👾cli/bootstrap] successfully bootrsrapped scared-ape...");
  } catch (error) {
    Logger.logAndExit(
      `❌ [👾cli/bootstrap] something went wrong while bootstrapping, ${error}`
    );
  }
})();
