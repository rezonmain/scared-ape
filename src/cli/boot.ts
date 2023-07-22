import "dotenv/config";
import { Booter } from "../utils/Booter.js";

(async () => {
  const booter = new Booter();
  await booter.boot();
  process.exit(0);
})();
