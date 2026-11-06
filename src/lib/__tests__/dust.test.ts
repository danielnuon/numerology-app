import { MOTE_COUNT, drawMotes, driftMotes, seedMotes, slideMotes } from "@/lib/dust";

/** A repeatable stand-in for Math.random. */
function seeded(start = 1) {
  let state = start;
  return () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}

describe("dust", () => {
  it("seeds a few dozen faint specks, each rising", () => {
    const motes = seedMotes(seeded());
    expect(motes).toHaveLength(MOTE_COUNT);
    for (const mote of motes) {
      expect(mote.driftY).toBeLessThan(0);
      expect(mote.alpha).toBeGreaterThan(0);
      expect(mote.alpha).toBeLessThanOrEqual(0.5);
    }
  });

  it("rises across the screen in 20 to 60 seconds", () => {
    for (const mote of seedMotes(seeded(7))) {
      const seconds = 1 / -mote.driftY / 1000;
      expect(seconds).toBeGreaterThanOrEqual(20);
      expect(seconds).toBeLessThanOrEqual(60);
    }
  });

  it("brings a speck that leaves the top back in at the bottom", () => {
    const [mote] = seedMotes(seeded(3));
    mote.y = -0.019;
    driftMotes([mote], 1000, () => 0.5);
    expect(mote.y).toBe(1.02);
    expect(mote.x).toBe(0.5);
  });

  it("slides with the scroll, larger specks more", () => {
    const small = { ...seedMotes(seeded())[0], y: 0.5, radius: 0.6 };
    const large = { ...small, radius: 2.2 };
    slideMotes([small, large], 100, 1000);
    expect(large.y).toBeCloseTo(0.5 - 0.1 * 0.08);
    expect(0.5 - small.y).toBeLessThan(0.5 - large.y);
  });

  it("draws every speck, steady with Reduce Motion", () => {
    const alphas: number[] = [];
    const ctx = {
      canvas: { width: 200, height: 400 },
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      set fillStyle(color: string) {
        alphas.push(Number(color.match(/,\s*([\d.]+)\)$/)?.[1]));
      },
    };
    const motes = seedMotes(seeded());
    drawMotes(ctx as never, motes, 2, 12345, true);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 200, 400);
    expect(ctx.fill).toHaveBeenCalledTimes(MOTE_COUNT);
    expect(alphas).toEqual(motes.map((mote) => mote.alpha));
  });
});
