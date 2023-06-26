import config from "config";
import express from "express";
import { Logger } from "../../utils/Logger.js";

export class Api {
  private ex: express.Express;
  private port: number;
  constructor() {
    this.ex = express();
    this.port = config.get("api.port");
  }

  start() {
    this.ex.get("/", async (req, res) => {
      res.send("Ape");
    });

    this.ex.listen(this.port, () => {
      Logger.log(`✅ [🚀Api][start()] Listening on port ${this.port}`);
    });
  }
}
