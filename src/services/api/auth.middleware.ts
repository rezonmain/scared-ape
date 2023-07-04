import type { NextFunction, request, response } from "express";
import { isNothingOrZero, parseCookie } from "../../utils/ez.js";

const authenticated = (
  req: typeof request,
  res: typeof response,
  next: NextFunction
) => {
  const cookies = parseCookie(req.headers.cookie);
  const fgp = cookies?.["__Secure-fgp"] ?? null;
  const jwt = cookies?.["__Secure-jwt"] ?? null;

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
