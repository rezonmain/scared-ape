import type { NextFunction, request, response } from "express";
import c from "config";

const cors = async (
  req: typeof request,
  res: typeof response,
  next: NextFunction
) => {
  res.setHeader("Access-Control-Allow-Origin", c.get("allowedOrigins"));
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
};

export { cors };
