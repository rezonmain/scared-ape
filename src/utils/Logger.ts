import c from "config";

export class Logger {
  static trace(): string {
    if (!c.get("logger.trace")) return "";
    const stack = new Error().stack.split("\n");
    return stack[2].substring(
      stack[2].indexOf("("),
      stack[2].lastIndexOf(")") + 1
    );
  }

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

  static log(...message: unknown[]): void {
    console.log(...message, this.trace());
  }
}
