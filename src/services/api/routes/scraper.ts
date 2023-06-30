import { Router } from "express";
import { isNothing } from "../../../utils/ez.js";
import { authenticated } from "../auth.middleware.js";
import { ScraperDto } from "./scraper.dto.js";

const scraperRouter = Router();
scraperRouter.use(authenticated);

/**
 * List all scrapers
 * @route GET /scraper
 */
scraperRouter.get("/", async (req, res) => {
  const scrapers = await req.ctx.db.getAllScrapers();
  const json = scrapers.map((s) => new ScraperDto(s));
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
  const json = new ScraperDto(scraper);
  return res.json(json);
});

export { scraperRouter };
