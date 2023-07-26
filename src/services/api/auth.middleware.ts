import type { NextFunction, request, response } from "express";
import { isNothingOrZero, parseCookie } from "../../utils/ez.js";
import { Logger } from "../../utils/Logger.js";

const authenticated = async (
  req: typeof request,
  res: typeof response,
  next: NextFunction
) => {
  try {
    if (!req.headers.cookie) return res.status(401).send("Unauthenticated");

    const cookies = parseCookie(req.headers.cookie);
    const fgp = cookies?.["__Secure-fgp"] ?? null;
    const jwt = cookies?.["__Secure-jwt"] ?? null;

    if (isNothingOrZero(fgp) || isNothingOrZero(jwt)) {
      return res.status(401).send("Unauthenticated");
    }

    if (
      req.ctx.auth.verifyJWT({ jwt, fgp }) &&
      !(await req.ctx.auth.isRevokedJWT({ jwt }))
    ) {
      next();
    } else {
      return res.status(403).send("Forbidden");
    }
  } catch (error) {
    Logger.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

const asPyro = async (
  req: typeof request,
  res: typeof response,
  next: NextFunction
) => {
  try {
    const cookies = parseCookie(req.headers.cookie);
    const jwt = cookies?.["__Secure-jwt"] ?? null;

    if (isNothingOrZero(jwt)) {
      return res.status(401).send("Unauthenticated");
    }

    const decodedJWT = req.ctx.auth.decodeJWT(jwt);
    const user = await req.ctx.db.getUserByCuid(decodedJWT?.cuid ?? "");

    if (isNothingOrZero(user)) {
      return res.status(401).send("Unauthenticated");
    }

    if (user.role !== "pyro") {
      return res.status(403).send("Forbidden");
    }

    next();
  } catch (error) {
    Logger.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

export { authenticated, asPyro };
