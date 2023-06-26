import { ToadScheduler, SimpleIntervalJob, AsyncTask } from "toad-scheduler";
import { Logger } from "../utils/Logger.js";
import { DB } from "./db/DB.js";
import { ScrapersHelper } from "../utils/ScrapersHelper.js";

export class Scheduler {
  private toadScheduler: ToadScheduler;
  public jobs: SimpleIntervalJob[] = [];
  constructor(private db: DB) {
    this.toadScheduler = new ToadScheduler();
  }

  public addJob({
    fn,
    name,
    interval,
  }: {
    fn: () => Promise<void>;
    name: string;
    interval: number;
  }): void {
    Logger.log(
      `🔄 [🦎Scheduler][addSimpleJob()] Adding job: ${name} with interval: ${interval} seconds`
    );
    const task = new AsyncTask(name, fn);
    const job = new SimpleIntervalJob({ seconds: interval }, task, {
      id: name,
    });
    this.jobs.push(job);
    this.toadScheduler.addSimpleIntervalJob(job);
    Logger.log(
      `✅ [🦎Scheduler][addSimpleJob()] Added job: ${name} with interval: ${interval} seconds`
    );
  }

  public stopJob(name: string) {
    this.toadScheduler.stopById(name);
  }

  public startJob(name: string) {
    this.toadScheduler.startById(name);
  }

  public removeJob(name: string) {
    this.toadScheduler.removeById(name);
    this.jobs = this.jobs.filter((job) => job.id !== name);
  }

  public getJob(name: string) {
    return this.jobs.find((job) => job.id === name);
  }

  public async start() {
    Logger.log("🔄 [🦎Scheduler][start()] Starting scheduler...");
    const activeScrapers = await this.db.getActiveScrapers();
    activeScrapers.forEach(async (scraper) => {
      const scraperInstance = await ScrapersHelper.getScraperInstance(
        scraper.name,
        this.db
      );
      this.addJob({
        fn: scraperInstance.scrape,
        name: scraper.name,
        interval: scraper.interval,
      });
    });
  }

  public stop() {
    Logger.log("🔄 [🦎Scheduler][stop()] Stopping scheduler...");
    this.toadScheduler.stop();
  }
}
