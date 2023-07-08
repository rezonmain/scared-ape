import { Router } from "express";
import { isNothing } from "../../../utils/ez.js";
import { ScraperDto } from "../dto/scraper.dto.js";

const scraperRouter = Router();

/**
 * List all scrapers
 * @route GET /scraper
 */
scraperRouter.get("/", async (req, res) => {
  const scrapers = await req.ctx.db.getAllScrapers();
  const json = scrapers.map((s) => new ScraperDto(s).dto);
  return res.json(json);
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
