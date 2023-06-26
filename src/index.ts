import config from "config";
import { ScaredApe } from "./ScaredApe.js";

const app = new ScaredApe();
config.get("app.bootstrapOnStartup") ? await app.bootstrap() : null;
app.run();
