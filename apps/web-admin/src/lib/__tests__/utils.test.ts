import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", true && "visible")).toBe("base visible");
  });

  it("handles array of classes", () => {
    expect(cn(["px-4", "py-2"], "mx-auto")).toBe("px-4 py-2 mx-auto");
  });

  it("resolves tailwind conflicts (later wins)", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("handles undefined and null values", () => {
    expect(cn("px-4", undefined, null, "py-2")).toBe("px-4 py-2");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });

  it("handles object syntax", () => {
    expect(cn({ "bg-red-500": true, "bg-blue-500": false })).toBe("bg-red-500");
  });

  it("handles mixed arguments", () => {
    expect(cn("base", ["flex", "items-center"], { active: true }, false && "hidden")).toBe(
      "base flex items-center active",
    );
  });
});
