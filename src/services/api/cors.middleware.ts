import type { NextFunction, request, response } from "express";
import allowedOrigins from "./allowedOrigins.js";

const cors = async (
  req: typeof request,
  res: typeof response,
  next: NextFunction
) => {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigins);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
};

export { cors };
