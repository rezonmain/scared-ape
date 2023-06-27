import config from "config";
import { createClient } from "redis";
import type { KeyValue } from "../../types/KeyValue.js";
import { Logger } from "../../utils/Logger.js";
import { Str } from "../../utils/Str.js";
import { isNothing } from "../../utils/ez.js";

export class Cache {
  protected client: ReturnType<typeof createClient>;
  constructor() {
    this.client = createClient({
      password: config.get("cache.redisLab.password"),
      socket: {
        host: config.get("cache.redisLab.host"),
        port: config.get("cache.redisLab.port"),
      },
    });
    this.client.on("error", (err) =>
      Logger.log("❌ [🌵Cache] Redis Client Error", err)
    );
  }

  async flush(): Promise<void> {
    try {
      await this.client.connect();
      await this.client.flushAll();
      Logger.log("✅ [🌵Cache][flush()] Cleared cache");
      this.client.disconnect();
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
   * Get a primitive value from the cache
   * @param key
   * @returns
   */
  async getPrimitive(key: string): Promise<string | undefined> {
    try {
      await this.client.connect();
      let value = await this.client.get(key);
      value = isNothing(value) ? undefined : value;
      Logger.log(
        `${value ? "✅" : "🆗"} [🌵Cache][get()] ${
          value ? "Cache hit" : "No hit"
        } -> ${Str.bound(key)}`
      );
      this.client.disconnect();
      return value;
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
   * Get a map from the cache
   * @param key
   * @returns
   */
  async get<T = unknown>(key: string): Promise<T | undefined> {
    try {
      await this.client.connect();
      let value = await this.client.json.get(key);
      value = isNothing(value) ? undefined : value;
      Logger.log(
        `${value ? "✅" : "🆗"} [🌵Cache][get()] ${
          value ? "Cache hit" : "No hit"
        } -> ${Str.bound(key)}`
      );
      this.client.disconnect();
      return value as T;
    } catch (error) {
      Logger.error(error);
    }
  }

  /**
   * Set a key value pair in the cache
   * @param key
   * @param value
   * @param expire in seconds
   */
  async set(
    key: string,
    value: string | KeyValue,
    expires?: number
  ): Promise<void> {
    try {
      await this.client.connect();
      if (typeof value === "string") {
        await this.client.set(key, value);
      } else {
        await this.client.json.set(key, ".", value);
      }
      Logger.log(`✅ [🌵Cache][set()] Set cache -> ${Str.bound(key)}`);
      if (expires) {
        await this.client.expire(key, expires);
        Logger.log(
          `✅ [🌵Cache][set()] Set Expires -> ${Str.bound(
            key
          )} in ${expires.toString()} seconds`
        );
      }
      this.client.disconnect();
    } catch (error) {
      Logger.error(error);
    }
  }
}
