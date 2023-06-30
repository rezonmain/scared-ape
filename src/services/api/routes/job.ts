import { Router } from "express";
import { authenticated } from "../auth.middleware.js";

const jobRouter = Router();

jobRouter.use(authenticated);

/**
 * Get all the registered jobs
 * @route GET /run
 * @queryparam ...
 * @paginated
 */
jobRouter.get("/", async (req, res) => {
  const jobs = req.ctx.scheduler.jobs;
  return res.json(
    jobs.map((j) => ({
      name: j.id,
      status: j.getStatus(),
    }))
  );
});

export { jobRouter };
