import type { Fetcher } from "../../Fetcher.js";
import config from "config";

export class Telegram {
  private path = "https://api.telegram.org/bot";
  private token: string;
  constructor(private fetcher: Fetcher) {
    this.token = config.get("notifier.telegram.token");
  }

  /**
   * Used for testing
   * @returns
   */
  async getMe() {
    return this.fetcher.get({
      url: `${this.path}${this.token}/getMe`,
    });
  }
}
