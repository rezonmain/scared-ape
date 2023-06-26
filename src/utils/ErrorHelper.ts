import type { Instanciable } from "../types/instanciable.js";

export class ErrorHelper {
  static instanceOf<T extends Instanciable>(
    error: unknown,
    instance: Instanciable
  ): InstanceType<T> | false {
    return error instanceof instance ? (error as InstanceType<T>) : false;
  }
}
