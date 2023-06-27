import type { Instanciable } from "../types/Instanciable.js";

export class ErrorHelper {
  static instanceOf<T extends Instanciable>(
    error: unknown,
    instance: Instanciable
  ): InstanceType<T> | false {
    return error instanceof instance ? (error as InstanceType<T>) : false;
  }
}
