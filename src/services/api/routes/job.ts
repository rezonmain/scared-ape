import { Router } from "express";

const jobRouter = Router();

/**
 * Get all the registered jobs
 * @route GET /run
 * @queryparam ...
 * @paginated
 */
jobRouter.get("/", async (req, res) => {
  const jobs = req.ctx.scheduler.jobs;
  res.json(
    jobs.map((j) => ({
      name: j.id,
      status: j.getStatus(),
    }))
  );
});

export { jobRouter };
