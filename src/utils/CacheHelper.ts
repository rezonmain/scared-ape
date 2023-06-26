const { createHmac } = await import("node:crypto");

export class CacheHelper {
  static hashData(str: string): string {
    const hash = createHmac("sha256", str).digest("hex");
    return hash;
  }
}
