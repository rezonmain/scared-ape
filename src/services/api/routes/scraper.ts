import { Router } from "express";
import { isNothing, otherwise, unsafeCoerce } from "../../../utils/ez.js";
import { ScraperDto } from "../dto/scraper.dto.js";
import { Pagination } from "../../../utils/Pagination.js";

const scraperRouter = Router();

/**
 * List all scrapers
 * @route GET /scraper
 */
scraperRouter.get("/", async (req, res) => {
  const limit = otherwise(req.query.limit, Pagination.defaultLimit);
  const page = otherwise(req.query.page, 0);
  const scrapers = await req.ctx.db.pgGetAllScrapers({
    limit: unsafeCoerce<number>(limit),
    offset: unsafeCoerce<number>(page) * unsafeCoerce<number>(limit),
  });
  if (isNothing(scrapers)) {
    return res
      .status(404)
      .send("No runs found for the provided scraper knownId");
  }
  return res.json(scrapers);
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

export { scraperRouter };
