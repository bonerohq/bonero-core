import "server-only";

import { headers } from "next/headers";
import type { ReactNode } from "react";
import type { BoneroInitialDataConfig, BoneroResolvedInitialData } from "./types";
import { getBoneroConfig } from "./config";
import { createBoneroClient } from "./util/bonero.client";
import { Bonero } from "./server/bonero";
import { applyBoneroNoCachePolicy } from "./server/no-cache";
import { BoneroProviderClient } from "./bonero.provider";

type BoneroProviderProps = {
  children: ReactNode;
  initialData?: BoneroInitialDataConfig;
  apiKey?: string;
  apiUrl?: string;
  pixelId?: string;
  tagManagerId?: string;
  liveSupportSiteKey?: string;
  /** SSR domain çözümlemesi için; verilmezse request host kullanılır. */
  domain?: string;
  /**
   * URL'de `?no-cache` varken SSR / Data Cache'i kırar (middleware ile birlikte).
   * `headers()` okuduğu için route'u dynamic yapar. Tam statik site için `false` verin.
   * @default true
   */
  noCacheParam?: boolean;
};

function readClientApiKey(serverApiKey: string): string {
  return process.env.NEXT_PUBLIC_BONERO_API_KEY ?? serverApiKey;
}

function readRequestDomain(override?: string): string | undefined {
  if (override?.trim()) return override.trim().split(":")[0];
  const headerStore = headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  return host?.split(":")[0];
}

export async function BoneroProvider({
  children,
  initialData = {},
  apiKey,
  apiUrl,
  pixelId,
  tagManagerId,
  liveSupportSiteKey,
  domain,
  noCacheParam = true,
}: BoneroProviderProps) {
  if (noCacheParam) {
    await applyBoneroNoCachePolicy();
  }

  const config = getBoneroConfig({ apiKey, apiUrl });
  const client = createBoneroClient(config);
  const requestDomain = readRequestDomain(domain);

  Bonero.registerInitialData(initialData);
  const [preloadedData] = await Promise.all([
    client.preloadSiteData(requestDomain),
    Bonero.prepareInitialData(config, initialData),
  ]);

  return (
    <BoneroProviderClient
      apiKey={readClientApiKey(config.apiKey)}
      apiUrl={config.apiUrl}
      domain={requestDomain}
      pixelId={pixelId ?? process.env.NEXT_PUBLIC_BONERO_META_PIXEL_ID}
      tagManagerId={tagManagerId ?? process.env.NEXT_PUBLIC_BONERO_GTM_ID}
      liveSupportSiteKey={
        liveSupportSiteKey ?? process.env.NEXT_PUBLIC_BONERO_LIVE_SUPPORT_SITE_KEY
      }
      preloadedData={preloadedData}
    >
      {children}
    </BoneroProviderClient>
  );
}

export type { BoneroResolvedInitialData };
