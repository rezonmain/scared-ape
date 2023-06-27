import { describe, it, expect } from "vitest";
import { isNothing } from "./ez";

describe("ez", () => {
  it.each([
    { a: 0, expected: false },
    { a: false, expected: false },
    { a: null, expected: true },
    { a: undefined, expected: true },
    { a: [], expected: true },
    { a: {}, expected: true },
    { a: NaN, expected: true },
    { a: "", expected: true },
    { a: " ", expected: true },
    { a: [null], expected: true },
  ])("isNothing($a) -> $expected", ({ a, expected }) => {
    expect(isNothing(a)).toBe(expected);
  });
});
