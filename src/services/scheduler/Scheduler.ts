import { ToadScheduler, SimpleIntervalJob, AsyncTask } from "toad-scheduler";
import { Logger } from "../../utils/Logger.js";
import type { DB } from "../db/DB.js";
import { ScrapersHelper } from "../../utils/ScrapersHelper.js";
import type { Notifier } from "../notifier/Notifier.js";
import { Service } from "../Service.js";

export class Scheduler extends Service {
  private toadScheduler: ToadScheduler;
  public jobs: SimpleIntervalJob[] = [];
  constructor(private db: DB, private notifier: Notifier) {
    super();
    this.toadScheduler = new ToadScheduler();
  }

  /**
   * Add a job to the scheduler
   * @param obj
   */
  public addJob({
    fn,
    name,
    interval,
  }: {
    fn: () => Promise<void>;
    name: string;
    interval: number;
  }): void {
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

  /**
   * Start the scheduler
   * add a job for each active scraper
   */
  public async start() {
    Logger.log("🔄 [🦎Scheduler][start()] Starting scheduler...");
    const activeScrapers = await this.db.getActiveScrapers();

    /**
     * For each active scraper,
     * create a job that runs the scraper's scrape() method
     */
    activeScrapers.forEach(async (scraper) => {
      const fn = async () => {
        const scraperInstance = await ScrapersHelper.getScraperInstance(
          scraper.name,
          this.db,
          this.notifier
        );
        scraperInstance.scrape();
      };

      this.addJob({
        fn,
        name: scraper.knownId,
        interval: scraper.interval,
      });
      this.running = true;
    });
  }

  public stop() {
    Logger.log("🔄 [🦎Scheduler][stop()] Stopping scheduler...");
    this.toadScheduler.stop();
    this.running = false;
  }
}
