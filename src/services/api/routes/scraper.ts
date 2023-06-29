import { Router } from "express";
import { isNothing } from "../../../utils/ez.js";

const scraperRouter = Router();

/**
 * List all scrapers
 * @route GET /scraper
 * @queryparam {boolean} [active] - Filter by active status
 */
scraperRouter.get("/", async (req, res) => {
  if (req.query.active) {
    const activeScrapers = await req.ctx.db.getActiveScrapers();
    res.json(activeScrapers);
  }
  const scrapers = await req.ctx.db.getAllScrapers();
  res.json(scrapers);
});

/**
 * Get a scraper by its knownId
 */
scraperRouter.get("/:knownId", async (req, res) => {
  const scraper = await req.ctx.db.getScraperbyKnownId(req.params.knownId);
  if (isNothing(scraper)) {
    res.status(404).send("Scraper not found");
    return;
  }
  res.json(scraper);
});

export { scraperRouter };
