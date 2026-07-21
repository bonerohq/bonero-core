import "server-only";

import { cache } from "react";
import { BONERO_NO_CACHE_HEADER, BONERO_NO_CACHE_PARAM } from "../constants/no-cache";
import { setBoneroRequestNoStore } from "../util/fetch-no-store";

function queryHasNoCache(raw: string): boolean {
  const query = raw.startsWith("?")
    ? raw.slice(1)
    : raw.includes("?")
      ? raw.slice(raw.indexOf("?") + 1)
      : raw;
  try {
    return new URLSearchParams(query).has(BONERO_NO_CACHE_PARAM);
  } catch {
    return new RegExp(`(?:^|[&])${BONERO_NO_CACHE_PARAM}(?:[=&]|$)`).test(query);
  }
}

/**
 * İstekte `?no-cache` (veya middleware'in set ettiği header) var mı?
 * React `cache` ile request boyunca tek kez çözülür.
 */
export const isBoneroNoCacheRequest = cache(async (): Promise<boolean> => {
  try {
    const { headers } = await import("next/headers");
    const h = await headers();

    if (h.get(BONERO_NO_CACHE_HEADER) === "1") return true;

    const invokeQuery = h.get("x-invoke-query");
    if (invokeQuery) {
      try {
        if (queryHasNoCache(decodeURIComponent(invokeQuery))) return true;
      } catch {
        if (queryHasNoCache(invokeQuery)) return true;
      }
    }

    for (const key of ["x-url", "x-forwarded-uri", "next-url"] as const) {
      const value = h.get(key);
      if (value && queryHasNoCache(value)) return true;
    }

    return false;
  } catch {
    return false;
  }
});

/**
 * `?no-cache` varsa Full Route Cache / Data Cache'i kırar.
 * @returns bypass aktif mi
 */
export async function applyBoneroNoCachePolicy(): Promise<boolean> {
  const bypass = await isBoneroNoCacheRequest();
  if (!bypass) return false;

  setBoneroRequestNoStore(true);

  try {
    const { unstable_noStore } = await import("next/cache");
    unstable_noStore();
  } catch {
    try {
      const { connection } = await import("next/server");
      await connection();
    } catch {
      // Next dışı ortam
    }
  }

  return true;
}

/** fetch() için cache modu — no-cache isteğinde her zaman taze veri. */
export async function getBoneroFetchCacheMode(): Promise<"no-store" | undefined> {
  if (await applyBoneroNoCachePolicy()) return "no-store";
  return undefined;
}
