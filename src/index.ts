import config from "config";
import { ScaredApe } from "./ScaredApe.js";
import { Booter } from "./utils/Booter.js";

if (config.get("app.bootOnStart")) {
  const booter = new Booter();
  await booter.boot();
}
const app = new ScaredApe();
app.run();
