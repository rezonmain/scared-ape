import c from "config";
import { ScaredApe } from "./ScaredApe.js";
import { Booter } from "./utils/Booter.js";
import { FileHelper } from "./utils/FileHelper.js";

if (!(await FileHelper.exists(`config/local-${process.env.NODE_ENV}.json5`))) {
  console.log(`🚨 No config file found`);
  process.exit(1);
}
(async () => {
  const booter = new Booter();
  await booter.boot({ initialScrape: c.get("scrapers.scrapeOnBoot") });
  const app = new ScaredApe();
  app.run();
})();
