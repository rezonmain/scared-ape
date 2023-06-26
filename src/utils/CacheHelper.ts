const { createHmac } = await import("node:crypto");

export class CacheHelper {
  static async hashData(str: string): Promise<string> {
    const hash = createHmac("sha256", str).digest("hex");
    return hash;
  }
}
