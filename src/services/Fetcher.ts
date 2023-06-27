import config from "config";
import type { FetchKey } from "../types/FetchKey.js";
import { Logger } from "../utils/Logger.js";
import type { Cache } from "./cache/Cache.js";

export class Fetcher {
  constructor(private cache: Cache) {}

  private getCacheKey = (key: FetchKey): string =>
    `${key?.method ?? "get"}:${key.url}:${JSON.stringify(key.body)}`;

  async fetch<T>(key: FetchKey): Promise<T> {
    const shouldCache = config.get("chacheOutbound");
    const cacheKey = this.getCacheKey(key);

    if (shouldCache) {
      const cachedValue = await this.cache.get(cacheKey);
      if (cachedValue) {
        return cachedValue as T;
      }
    }

    Logger.log(
      `🔄 [🌮Fetcher][fetch()] Executing request ${(
        key?.method ?? "get"
      ).toUpperCase()} ${new URL(key.url).origin}`
    );
    try {
      const response = await fetch(key.url, {
        ...key,
      });
      if (!response.ok) {
        throw response;
      }
      Logger.log(
        `✅ [🌮Fetcher][fetch()] Executed request ${(
          key?.method ?? "get"
        ).toUpperCase()} ${new URL(key.url).origin}`
      );
      const content = await response.json();
      shouldCache && this.cache.set(cacheKey, content, 1 * 60 * 30);
      return content;
    } catch (error) {
      if (error instanceof Response) {
        const content = await error.json();
        Logger.log(
          `❌ [🌮Fetcher] Got a bad response: ${JSON.stringify(content)}`
        );
        return;
      }
      Logger.error(`❌ [🌮Fetcher] Something went wrong executing request`);
      Logger.error(error);
    }
  }

  async get<T>(key: FetchKey): Promise<T> {
    return await this.fetch<T>(key);
  }

  async post<T>(key: FetchKey): Promise<T> {
    return await this.fetch<T>({
      ...key,
      method: "post",
    });
  }

  async put<T>(key: FetchKey): Promise<T> {
    return await this.fetch<T>({
      ...key,
      method: "put",
    });
  }
}
