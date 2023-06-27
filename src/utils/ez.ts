/**
 * Returns true for empty values, check .spec for details.
 * @param value
 * @returns
 */
export const isNothing = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === "string" && value.trim() === "") {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  if (typeof value === "object" && Object.keys(value).length === 0) {
    return true;
  }
  if (typeof value === "number" && isNaN(value)) {
    return true;
  }
  if (Array.isArray(value) && value.every((v) => isNothing(v))) {
    return true;
  }
  return false;
};

export const otherwise = <T = unknown>(value: T, fallback: unknown): T => {
  if (isNothing(value)) {
    return typeof fallback === "function" ? fallback() : fallback;
  }
};

/**
 * Same as isNothing but also returns true for 0.
 * @param value
 * @returns
 */
export const isNothingOrZero = (value: unknown): boolean => {
  if (isNothing(value)) {
    return true;
  }
  if (typeof value === "number" && value === 0) {
    return true;
  }
  return false;
};
