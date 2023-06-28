import fs from "fs/promises";
import { Logger } from "./Logger.js";

/**
 * Utility functions for file operations.
 */
export class FileHelper {
  static async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  static async readAsString(path: string): Promise<string> {
    try {
      const str = await fs.readFile(path, "utf-8");
      return str;
    } catch (error) {
      Logger.error(
        `[FileHelper][asString()] Error reading file ${path}, ${error}`
      );
    }
  }

  static async write(path: string, obj: object): Promise<void> {
    try {
      await fs.writeFile(path, JSON.stringify(obj, null, 2));
    } catch (error) {
      Logger.error(
        `[FileHelper][write()] Error writing file ${path}, ${error}`
      );
    }
  }
}
