import { Router } from "express";
import { isNothing, otherwise, unsafeCoerce } from "../../../utils/ez.js";
import { ScraperDto } from "../dto/scraper.dto.js";
import { Pagination } from "../../../utils/Pagination.js";
import { authenticated } from "../auth.middleware.js";

const scraperRouter = Router();

scraperRouter.use(authenticated);
/**
 * List all scrapers
 * @route GET /scraper
 * @query limit - The number of scrapers to return
 * @query page - The page of scrapers to return
 */
scraperRouter.get("/", async (req, res) => {
  const limit = otherwise(req.query.limit, Pagination.defaultLimit);
  const page = otherwise(req.query.page, 0);
  const { pagination, list } = await req.ctx.db.pgGetAllScrapers({
    limit: unsafeCoerce<number>(limit),
    offset: unsafeCoerce<number>(page) * unsafeCoerce<number>(limit),
  });
  if (isNothing(list)) {
    return res
      .status(404)
      .send("No runs found for the provided scraper knownId");
  }
  const scrapers = list.map((scraper) => new ScraperDto(scraper).dto);
  return res.json({ pagination, list: scrapers });
});

/**
 * Get a scraper by its knownId
 */
scraperRouter.get("/:knownId", async (req, res) => {
  const scraper = await req.ctx.db.getScraperbyKnownId(req.params.knownId);
  if (isNothing(scraper)) {
    return res.status(404).send("Scraper not found");
  }
  const json = new ScraperDto(scraper).dto;
  return res.json(json);
});

/**
 * Get the latest scraper json
 */

scraperRouter.get("/:knownId/json", async (req, res) => {
  const json = await req.ctx.db.getLatestJson(req.params.knownId);
  if (isNothing(json)) {
    return res.status(404).send("No JSON found for the provided scraper");
  }
  return res.json(json);
});

export { scraperRouter };
