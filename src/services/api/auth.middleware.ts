import type { NextFunction, request, response } from "express";
import { isNothingOrZero } from "../../utils/ez.js";

const authenticated = (
  req: typeof request,
  res: typeof response,
  next: NextFunction
) => {
  const fgp = req.cookies?.["__Secure-fgp"] ?? null;
  const jwt = req.cookies?.["__Secure-jwt"] ?? null;

  if (isNothingOrZero(fgp) || isNothingOrZero(jwt)) {
    return res.status(401).send("Unauthenticated");
  }

  if (req.ctx.auth.verifyJWT({ jwt, fgp })) {
    next();
  } else {
    return res.status(403).send("Forbidden");
  }
};

export { authenticated };
