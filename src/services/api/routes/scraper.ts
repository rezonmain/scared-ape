import { Router } from "express";
import { isNothing } from "../../../utils/ez.js";

const scraperRouter = Router();

/**
 * List all scrapers
 * @route GET /scraper
 */
scraperRouter.get("/", async (req, res) => {
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