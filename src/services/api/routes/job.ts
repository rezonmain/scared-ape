import { Router } from "express";
import { authenticated } from "../auth.middleware.js";
import { JobDto } from "../dto/job.dto.js";

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
  const json = jobs.map(
    (j) => new JobDto({ name: j.id, status: j.getStatus() })
  );
  return res.json(json);
});

export { jobRouter };
