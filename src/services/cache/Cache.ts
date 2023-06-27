import config from "config";
import { createClient } from "redis";
import type { KeyValue } from "../../types/KeyValue.js";
import { Logger } from "../../utils/Logger.js";
import { Str } from "../../utils/Str.js";

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

  /**
   * Get a primitive value from the cache
   * @param key
   * @returns
   */
  async getPrimitive(key: string): Promise<string | undefined> {
    try {
      const value = await this.client.get(key);
      Logger.log(
        `✅ [🌵Cache][getPrimitive()] ${value ? "OK" : "OK-404"} -> ${Str.bound(
          key
        )}`
      );
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
  async get(key: string): Promise<KeyValue | undefined> {
    try {
      const value = await this.client.hGetAll(key);
      Logger.log(
        `✅ [🌵Cache][get()] ${value ? "OK" : "OK-404"} -> ${Str.bound(key)}`
      );
      return value;
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
      if (typeof value === "string") {
        await this.client.set(key, value);
      } else {
        await this.client.hSet(key, value);
      }
      Logger.log(`✅ [🌵Cache][set()] OK -> ${Str.bound(key)}`);
      if (expires) {
        await this.client.expire(key, expires);
        Logger.log(
          `✅ [🌵Cache][set()] Expires -> ${Str.bound(
            key
          )} at ${expires.toString()}`
        );
      }
    } catch (error) {
      Logger.error(error);
    }
  }
}
