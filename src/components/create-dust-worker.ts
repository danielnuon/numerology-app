/**
 * Starts the worker that draws the drifting dust (`dust.worker.ts`). It has
 * a file of its own because `import.meta.url` can't be read under Jest, so
 * tests of `LanternSky` replace this module.
 */
export function createDustWorker(): Worker {
  return new Worker(new URL("./dust.worker.ts", import.meta.url), { type: "module" });
}
