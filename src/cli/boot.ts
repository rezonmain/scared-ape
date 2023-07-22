import "dotenv/config";
import { Booter } from "../utils/Booter.js";

(async () => {
  const booter = new Booter();
  await booter.boot({ scrapeOnBoot: true });
  process.exit(0);
})();
