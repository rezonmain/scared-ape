import type { NextFunction, request, response } from "express";
import { isNothingOrZero } from "../../utils/ez.js";

const authenticated = (
  req: typeof request,
  res: typeof response,
  next: NextFunction
) => {
  const token = req.headers.authorization;
  if (isNothingOrZero(token)) {
    return res.status(401).send("Unauthenticated");
  }
  if (req.ctx.auth.verify(token)) {
    next();
  } else {
    return res.status(403).send("Forbidden");
  }
};

export { authenticated };
