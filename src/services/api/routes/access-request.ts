import { Router } from "express";
import { isNothing, otherwise, unsafeCoerce } from "../../../utils/ez.js";
import { authenticated, asPyro } from "../auth.middleware.js";
import { accessRequestLimiter } from "../limiter.middleware.js";
import { z } from "zod";
import { ErrorHelper } from "../../../utils/ErrorHelper.js";
import { Pagination } from "../../../utils/Pagination.js";
import { AccessRequestDto } from "../dto/accessRequest.dto.js";

const accessRequestRouter = Router();

/**
 * The only public route for access request
 * @query email
 */
accessRequestRouter.post("/", accessRequestLimiter, async (req, res) => {
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

  res.cookie("lastAccessRequest", email, {
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
  });

  return res.status(201).json({ email });
});

accessRequestRouter.use(authenticated);

/**
 * Get a paginate list of access requests
 * @route GET /access_request
 * @query limit - The number of accessRequests to return
 * @query page - The page of accessRequests to return
 */
accessRequestRouter.get("/", asPyro, async (req, res) => {
  const limit = unsafeCoerce<number>(
    otherwise(req.query.limit, Pagination.defaultLimit)
  );
  const page = unsafeCoerce<number>(otherwise(req.query.page, 1));
  const { pagination, list } = await req.ctx.db.pgGetAccessRequests({
    limit,
    offset: page * limit - limit,
  });
  if (isNothing(list)) {
    return res
      .status(404)
      .json({ error: ErrorHelper.message("access_request_002") });
  }
  const accessRequests = list.map(
    (accessRequest) => new AccessRequestDto(accessRequest).dto
  );
  return res.json({ pagination, list: accessRequests });
});

/**
 * Update the status of an access request
 * @route PUT /access_request/:email
 * @query whitelisted - The new whitelisted status required
 */

accessRequestRouter.put("/:email", asPyro, async (req, res) => {
  const unsafeWhitelisted = req.query.whitelisted;
  let whitelisted: boolean;
  try {
    whitelisted = z.boolean().parse(unsafeWhitelisted);
  } catch {
    return res.status(400).json({
      error: ErrorHelper.message("access_request_003"),
    });
  }

  const accessRequest = await req.ctx.db.getAccessRequestByEmail(
    req.params.email
  );

  if (isNothing(accessRequest)) {
    return res.status(404).json({
      error: ErrorHelper.message("access_request_002"),
    });
  }

  try {
    await req.ctx.db.updateAccessRequest(accessRequest.email, whitelisted);
  } catch (error) {
    return res.status(500).json({ error });
  }
  return res.sendStatus(204);
});

export { accessRequestRouter };
