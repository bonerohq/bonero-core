import { cache } from "react";

/**
 * Request-scoped flag — React `cache` ile izole.
 * `applyBoneroNoCachePolicy` set eder; `createBoneroClient` okur.
 */
const getNoStoreSlot = cache((): { value: boolean } => ({ value: false }));

export function setBoneroRequestNoStore(enabled: boolean): void {
  getNoStoreSlot().value = enabled;
}

export function getBoneroRequestNoStore(): boolean {
  return getNoStoreSlot().value;
}
