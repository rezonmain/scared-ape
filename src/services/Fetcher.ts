import type { FetchKey } from "../types/FetchKey.js";
import { Logger } from "../utils/Logger.js";
import { Str } from "../utils/Str.js";
import type { Cache } from "./cache/Cache.js";

export class Fetcher {
  constructor(private cache: Cache) {}

  private getCacheKey = (key: FetchKey): string =>
    `${key?.method ?? "get"}:${key.url}:${JSON.stringify(key.body)}`;

  async fetch<T>(key: FetchKey): Promise<T> {
    const cacheKey = this.getCacheKey(key);
    const cachedValue = await this.cache.get(cacheKey);
    if (cachedValue) {
      Logger.log(
        `✅ [🌮Fetcher][fetch()] Cache hit for ${Str.bound(cacheKey)}`
      );
      return cachedValue as T;
    }

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
      return await response.json();
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
