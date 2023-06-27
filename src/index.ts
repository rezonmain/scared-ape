import config from "config";
import { ScaredApe } from "./ScaredApe.js";

const app = new ScaredApe();
config.get("app.bootOnStart") ? await app.boot() : null;
app.run();
