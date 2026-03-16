import { requireString, optionalString, requireInt } from "../lib/validate";

describe("requireString", () => {
  it("accepts valid strings", () => {
    expect(requireString("hello", "field")).toBe("hello");
    expect(requireString("  trimmed  ", "field")).toBe("trimmed");
  });
  it("throws on empty string", () => {
    expect(() => requireString("", "field")).toThrow("Invalid field");
    expect(() => requireString("   ", "field")).toThrow("Invalid field");
  });
  it("throws on non-string", () => {
    expect(() => requireString(null as any, "field")).toThrow();
    expect(() => requireString(42 as any, "field")).toThrow();
  });
});

describe("optionalString", () => {
  it("returns undefined for nullish", () => {
    expect(optionalString(null)).toBeUndefined();
    expect(optionalString(undefined)).toBeUndefined();
  });
  it("returns trimmed string", () => {
    expect(optionalString("  hello  ")).toBe("hello");
  });
  it("returns undefined for empty", () => {
    expect(optionalString("")).toBeUndefined();
    expect(optionalString("   ")).toBeUndefined();
  });
});

describe("requireInt", () => {
  it("accepts integers", () => {
    expect(requireInt(5, "num")).toBe(5);
    expect(requireInt("10", "num")).toBe(10);
  });
  it("throws on float", () => {
    expect(() => requireInt(1.5, "num")).toThrow();
  });
  it("throws on NaN", () => {
    expect(() => requireInt("abc", "num")).toThrow();
  });
});
