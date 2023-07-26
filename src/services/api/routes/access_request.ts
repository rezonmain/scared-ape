import { Router } from "express";
import { isNothing, otherwise, parseCookie } from "../../../utils/ez.js";
import { authenticated } from "../auth.middleware.js";
import { accessRequestLimiter } from "../limiter.middleware.js";
import { z } from "zod";
import { ErrorHelper } from "../../../utils/ErrorHelper.js";

const accessRequestRouter = Router();

/**
 * The only public route for access request
 * @query email
 */
accessRequestRouter.post("/", accessRequestLimiter, async (req, res) => {
  const cookies = parseCookie(req.headers.cookie);
  const count = parseInt(otherwise(cookies?.accessRequestCount, 0));

  res.cookie("accessRequestCount", count + 1, {
    maxAge: 1000 * 60 * 30, // 30 minutes
  });

  if (count >= 2) {
    return res.status(429).json({
      error: ErrorHelper.message("general_002"),
    });
  }

  const unsafeEmail = req.query.email;
  let email: string;
  try {
    email = z.string().email().parse(unsafeEmail);
  } catch {
    return res.status(400).json({
      error: ErrorHelper.message("auth_003"),
    });
  }

  const accessRequest = await req.ctx.db.getAccessRequestByEmail(email);

  if (!isNothing(accessRequest)) {
    return res.status(409).json({
      error: ErrorHelper.message("access_request_001"),
    });
  }

  try {
    await req.ctx.db.saveAccessRequest(email);
  } catch (error) {
    return res.status(500).json({ error });
  }
  return res.sendStatus(201);
});

accessRequestRouter.use(authenticated);

export { accessRequestRouter };
