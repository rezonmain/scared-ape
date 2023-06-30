import { Router } from "express";
import { isNothing, otherwise, unsafeCoerce } from "../../../utils/ez.js";
import { Pagination } from "../../../utils/Pagination.js";
import { authenticated } from "../auth.middleware.js";

const runRouter = Router();
runRouter.use(authenticated);

/**
 * Get a list of latest runs
 * @route GET /run
 * @queryparam ...
 * @paginated
 */
runRouter.get("/", async (req, res) => {
  res.status(418).send(["not", "implemented"]);
});

/**
 * Get a list of runs for a scraper via scraper knownId
 * @paginated
 */
runRouter.get("/:scraperKnownId", async (req, res) => {
  const limit = otherwise(req.query.limit, Pagination.defaultLimit);
  const page = otherwise(req.query.page, 0);
  const runs = await req.ctx.db.pgGetRunsForScraper(req.params.scraperKnownId, {
    limit: unsafeCoerce<number>(limit),
    offset: unsafeCoerce<number>(page) * unsafeCoerce<number>(limit),
  });
  if (isNothing(runs)) {
    res.status(404).send("No runs found for the provided scraper knownId");
    return;
  }
  res.json(runs);
});

export { runRouter };
