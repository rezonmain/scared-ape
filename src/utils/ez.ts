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
