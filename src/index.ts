import { ScaredApe } from "./ScaredApe.js";
import { FileHelper } from "./utils/FileHelper.js";

if (!(await FileHelper.exists(`config/local-${process.env.NODE_ENV}.json5`))) {
  const env = process.env.NODE_ENV ?? "dev";
  console.log(
    `🚨 No config file found. Run boot script: pnpm boot${
      env === "dev" ? ":dev" : ""
    }`
  );
  process.exit(1);
}
const app = new ScaredApe();
app.run();
