import { getTierColorClass, getTierTextClass } from "../chart-helpers";

describe("getTierColorClass", () => {
  it("gives each lit tier a light tint of its color", () => {
    expect(getTierColorClass("very-strong")).toBe("bg-tier-very-strong/15");
    expect(getTierColorClass("strong")).toBe("bg-tier-strong/15");
    expect(getTierColorClass("moderate")).toBe("bg-tier-moderate/15");
    expect(getTierColorClass("weak")).toBe("bg-tier-weak/15");
  });

  it("gives zero the full-strength token, with no tint", () => {
    expect(getTierColorClass("zero")).toBe("bg-tier-zero");
  });
});

describe("getTierTextClass", () => {
  it("gives each lit tier the text color of its light", () => {
    expect(getTierTextClass("very-strong")).toBe("text-tier-very-strong");
    expect(getTierTextClass("strong")).toBe("text-tier-strong");
    expect(getTierTextClass("moderate")).toBe("text-tier-moderate");
    expect(getTierTextClass("weak")).toBe("text-tier-weak");
  });

  it("keeps zero faint", () => {
    expect(getTierTextClass("zero")).toBe("text-ink-faint");
  });
});
