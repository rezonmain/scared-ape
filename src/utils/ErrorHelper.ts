export class ErrorHelper {
  static instanceOf<T extends abstract new (...args: any) => any>(
    error: unknown,
    instance: Function
  ): InstanceType<T> | false {
    return error instanceof instance ? (error as InstanceType<T>) : false;
  }
}
