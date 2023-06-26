/*
  running - The run is currently in progress.
  success - The run completed successfully and found new data.
  failure - Something went wrong during the run.
  cached - The run completed successfully but did not find new data
*/
export type RunStatus = "running" | "success" | "failure" | "cached";
