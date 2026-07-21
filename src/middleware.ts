import { NextResponse, type NextRequest } from "next/server";
import { BONERO_NO_CACHE_HEADER, BONERO_NO_CACHE_PARAM } from "./constants/no-cache";

export { BONERO_NO_CACHE_HEADER, BONERO_NO_CACHE_PARAM };

/**
 * URL'de `?no-cache` varsa request header'ına işaret koyar.
 * Layout / BoneroProvider searchParams görmediği için SSR cache bypass buradan tetiklenir.
 *
 * @example
 * // middleware.ts
 * import { boneroNoCacheMiddleware } from "@linqon/bonero-core/middleware";
 *
 * export function middleware(request: NextRequest) {
 *   return boneroNoCacheMiddleware(request) ?? NextResponse.next();
 * }
 */
export function boneroNoCacheMiddleware(request: NextRequest): NextResponse | undefined {
  if (!request.nextUrl.searchParams.has(BONERO_NO_CACHE_PARAM)) {
    return undefined;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(BONERO_NO_CACHE_HEADER, "1");

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}
