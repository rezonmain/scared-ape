import { ScaredApe } from "./ScaredApe.js";
import { FileHelper } from "./utils/FileHelper.js";

if (!(await FileHelper.exists(`config/local-${process.env.NODE_ENV}.json5`))) {
  console.log("🚨 No config file found. Run boot script: pnpm boot");
  process.exit(1);
}
const app = new ScaredApe();
app.run();
