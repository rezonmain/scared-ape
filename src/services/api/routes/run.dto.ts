import type { Run } from "../../../models/Run.js";

class RunDto implements Run {
  constructor(private opts: Run) {}
  get scraperId() {
    return this.opts.scraperId;
  }
  get status() {
    return this.opts.status;
  }
}

export { RunDto };
