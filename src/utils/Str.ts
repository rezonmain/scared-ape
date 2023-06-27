/**
 * String utilities
 */
export class Str {
  /**
   * Bound a string to a certain length
   * if the string is longer than the limit (defualt is 50 chars),
   * it will be truncated and an ellipsis will be appended by defualt
   * @param str
   * @param limit
   * @param ellipsis
   * @returns
   */
  static bound(str: string, limit = 50, ellipsis = true) {
    return str.length > limit
      ? str.slice(0, limit) + ellipsis
        ? "..."
        : ""
      : str;
  }
}
