/**
 * useIsHydrated
 *
 * Tells a client component whether it has finished hydrating. Anything
 * that only the browser knows (localStorage, above all) must wait for it:
 * reading it during hydration would render different markup from the
 * server and cause a hydration error.
 */

import { useSyncExternalStore } from "react";

const subscribeToNothing = () => () => {};

/** False during server render and hydration, true afterwards. */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  );
}
