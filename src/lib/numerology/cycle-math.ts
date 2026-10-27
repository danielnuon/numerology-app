/**
 * Cycle Math
 *
 * Small arithmetic helpers shared by every part of the calculation. Khmer
 * numerology is built from repeating cycles (12 months, 12 zodiac animals,
 * 7 weekdays, a 12-year life cycle), so the same two operations show up
 * everywhere: wrapping an offset into a cycle, and laying out a cycle that
 * starts at an arbitrary position.
 */

/**
 * Modulo that always returns a value in [0, divisor).
 *
 * JavaScript's `%` keeps the sign of the dividend (`-1 % 12 === -1`), which
 * breaks cycle lookups for years before the birth year or zodiac years before
 * the reference Rat year.
 */
export function positiveMod(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

/**
 * Returns `length` consecutive values from a 1-based cycle of `cycleSize`,
 * beginning at `start` and wrapping back to 1 after `cycleSize`.
 *
 * Every row of the numerology chart is built this way: the person's own
 * position (month, animal or weekday) goes in the first column and the rest
 * of the cycle follows in order.
 *
 * Example: rotatedCycle(8, 12) → [8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7]
 */
export function rotatedCycle(
  start: number,
  cycleSize: number,
  length: number = cycleSize
): number[] {
  return Array.from(
    { length },
    (_, i) => positiveMod(start - 1 + i, cycleSize) + 1
  );
}
