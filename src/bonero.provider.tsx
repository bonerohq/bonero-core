"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { SiteIntegrations } from "./accesor/site-integrations";
import { BoneroLoading } from "./accesor/bonero-loading";
import { BoneroContext, type BoneroContextValue } from "./context/bonero.context";
import { createBoneroClient } from "./util/bonero.client";
import {
  mergeSiteIntegrationConfig,
  resolveWebSiteIntegration,
} from "./util/site-integration";
import type { BoneroConfig, BoneroPreloadData } from "./types";

interface BoneroProviderProps {
  children: ReactNode;
  apiKey: string;
  pixelId?: string;
  tagManagerId?: string;
  liveSupportSiteKey?: string;
  domain?: string;
  apiUrl?: string;
  preloadedData?: BoneroPreloadData;
}

function readRuntimeDomain(fallback?: string): string | undefined {
  if (typeof window !== "undefined" && window.location.hostname) {
    return window.location.hostname;
  }
  return fallback;
}

export function BoneroProviderClient({
  children,
  apiKey,
  apiUrl,
  pixelId,
  tagManagerId,
  liveSupportSiteKey,
  domain,
  preloadedData,
}: BoneroProviderProps) {
  const config = useMemo<BoneroConfig>(() => ({ apiKey, apiUrl }), [apiKey, apiUrl]);
  const client = useMemo(() => createBoneroClient(config), [config]);

  const [data, setData] = useState<BoneroPreloadData | null>(preloadedData ?? null);
  const [isLoading, setIsLoading] = useState(preloadedData === undefined);
  const [error, setError] = useState<string | null>(null);
  const [runtimeDomain, setRuntimeDomain] = useState<string | undefined>(domain);

  useEffect(() => {
    setRuntimeDomain(readRuntimeDomain(domain));
  }, [domain]);

  useEffect(() => {
    if (preloadedData) return;

    let cancelled = false;

    client
      .preloadSiteData(runtimeDomain)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Bonero verileri yüklenemedi.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client, preloadedData, runtimeDomain]);

  const contextValue = useMemo<BoneroContextValue>(
    () => ({
      config,
      data,
      isLoading,
      isReady: !isLoading && data !== null && error === null,
      error,
    }),
    [config, data, isLoading, error],
  );

  const integrationConfig = useMemo(
    () =>
      mergeSiteIntegrationConfig(
        resolveWebSiteIntegration(data?.webSiteIntegrations, runtimeDomain),
        {
          gtmId: tagManagerId ?? process.env.NEXT_PUBLIC_BONERO_GTM_ID,
          metaPixelId: pixelId ?? process.env.NEXT_PUBLIC_BONERO_META_PIXEL_ID,
          liveSupportSiteKey:
            liveSupportSiteKey ?? process.env.NEXT_PUBLIC_BONERO_LIVE_SUPPORT_SITE_KEY,
        },
      ),
    [
      data?.webSiteIntegrations,
      runtimeDomain,
      tagManagerId,
      pixelId,
      liveSupportSiteKey,
    ],
  );

  const showContent = contextValue.isReady;

  return (
    <BoneroContext.Provider value={contextValue}>
      <SiteIntegrations
        gtmId={integrationConfig.gtmId}
        metaPixelId={integrationConfig.metaPixelId}
        liveSupportSiteKey={integrationConfig.liveSupportSiteKey}
        apiUrl={config.apiUrl}
      />
      {!showContent ? <BoneroLoading /> : null}
      {showContent ? children : null}
    </BoneroContext.Provider>
  );
}
