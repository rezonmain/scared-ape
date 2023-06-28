import { Booter } from "../utils/Booter.js";

(async () => {
  const booter = new Booter();
  await booter.boot({ initialScrape: false });
})();
