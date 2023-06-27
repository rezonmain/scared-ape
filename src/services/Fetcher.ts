import type { FetcKey } from "../types/FetchKey.js";
import { Logger } from "../utils/Logger.js";
import type { Cache } from "./cache/Cache.js";

export class Fetcher {
  protected cache: Map<string, string>;
  constructor(private cahce: Cache) {}
}
