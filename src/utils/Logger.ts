export class Logger {
  static logAndThrow(...error: unknown[]): void {
    console.error(error);
    throw error;
  }

  static logAndExit(...message: string[]): void {
    console.error(...message, " exiting...");
    process.exit(1);
  }

  static error(...error: unknown[]): void {
    console.error(...error);
  }

  static log(...message: string[]): void {
    console.log(...message);
  }
}
