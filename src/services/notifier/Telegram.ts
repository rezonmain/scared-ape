import { Notifier } from "./Notifier.js";
import type { Fetcher } from "../Fetcher.js";

export class Telegram extends Notifier {
  private path = "https://api.telegram.org/bot";
  constructor(private fetcher: Fetcher) {
    super();
  }
}
