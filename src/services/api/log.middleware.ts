import type { NextFunction, request, response } from "express";
import { Logger } from "../../utils/Logger.js";

const log = (req: typeof request, res: typeof response, next: NextFunction) => {
  if (res.headersSent) {
    Logger.log(
      "➡️  [🚀Api]",
      req.method,
      req.baseUrl ?? "" + req.url ?? "",
      res.statusCode
    );
  } else {
    res.on("finish", () => {
      Logger.log(
        "➡️  [🚀Api]",
        req.method,
        req.baseUrl ?? "" + req.url ?? "",
        res.statusCode
      );
    });
  }
  next();
};

export { log };
