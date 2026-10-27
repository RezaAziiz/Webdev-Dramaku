import { formatMetaLine, formatRuntime } from "./format";

describe("formatRuntime", () => {
  it("omits unavailable runtime metadata", () => {
    expect(formatRuntime()).toBeNull();
    expect(formatRuntime({ runtime: 0 })).toBeNull();
    expect(formatMetaLine({ year: "2025" })).toBe("2025");
  });

  it("formats a known runtime", () => {
    expect(formatRuntime({ runtime: 124 })).toBe("124 min");
    expect(formatMetaLine({ year: "2025", runtime: 124 })).toBe(
      "2025 • 124 min",
    );
  });
});
