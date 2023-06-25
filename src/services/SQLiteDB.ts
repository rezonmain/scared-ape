import { DB } from "./DB.js";

export class SQLiteDB implements DB {
  connect(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  disconnect(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
