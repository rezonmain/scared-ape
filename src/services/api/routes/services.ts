import { Router } from "express";
import { isNothing } from "../../../utils/ez.js";

const servicesRouter = Router();

/**
 * List all services
 * @route GET /scraper
 */
servicesRouter.get("/", async (req, res) => {
  const services = req.ctx.services;
  const json = services.map((s) => s.dto);
  return res.json(json);
});

/**
 * Get a service by its name
 */
servicesRouter.get("/:serviceName", async (req, res) => {
  const service = req.ctx.services.find(
    (s) => s.name === req.params.serviceName
  );
  if (isNothing(service)) {
    return res.status(404).json({ error: "Service not found" });
  }
  const json = service.dto;
  return res.json(json);
});

export { servicesRouter };
