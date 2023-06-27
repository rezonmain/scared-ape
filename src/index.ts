import config from "config";
import { ScaredApe } from "./ScaredApe.js";

const app = new ScaredApe();
if (config.get("app.bootOnStart")) {
  await app.boot();
}
app.run();
