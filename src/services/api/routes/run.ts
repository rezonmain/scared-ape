import { Router } from "express";
import { isNothing, otherwise, unsafeCoerce } from "../../../utils/ez.js";
import { Pagination } from "../../../utils/Pagination.js";

const router = Router();

/**
 * Get a list of latest runs
 * @route GET /run
 * @queryparam ...
 * @paginated
 */
router.get("/", async (req, res) => {
  res.status(418).send(["not", "implemented"]);
});

/**
 * Get a list of runs for a scraper via scraper knownId
 * @paginated
 */
router.get("/:scraperKnownId", async (req, res) => {
  const limit = otherwise(req.query.limit, Pagination.defaultLimit);
  const page = otherwise(req.query.page, 1);
  const runs = await req.ctx.db.pgGetRunsForScraper(req.params.scraperKnownId, {
    limit: unsafeCoerce<number>(limit),
    offset: unsafeCoerce<number>(page),
  });
  if (isNothing(runs)) {
    res.status(404).send("No runs found");
    return;
  }
  res.json(runs);
});
