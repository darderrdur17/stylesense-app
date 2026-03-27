import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * True on the client after hydration, false on the server — without useEffect.
 */
export function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}
