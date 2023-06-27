import fs from "fs/promises";
import config from "config";

/**
 * Utility functions for managing migrations.
 */
export class MigrationsHelper {
  static async list(): Promise<string[]> {
    const pathname = config.get("database.migrations.path") as string;
    return await fs.readdir(pathname);
  }

  static async getAll(): Promise<
    Array<{ name: string; version: number; content: string[] }>
  > {
    const migrations = await this.list();
    const pathname = config.get("database.migrations.path") as string;
    const promises = migrations.map(async (migration) => {
      const content = await fs.readFile(`${pathname}/${migration}`, "utf-8");
      const version = parseInt(migration.split("_")[0]);
      return {
        name: migration,
        version,
        content: content
          .replaceAll("\n", "")
          .split(";")
          .filter((s) => s)
          .map((s) => s + ";"),
      };
    });
    const resolvedMigrations = await Promise.all(promises);
    return resolvedMigrations.sort((a, b) => a.version - b.version);
  }
}
