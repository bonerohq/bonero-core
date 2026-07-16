"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { SiteAnalytics } from "./accesor/site-analytics";
import { BoneroLoading } from "./accesor/bonero-loading";
import { BoneroContext, type BoneroContextValue } from "./context/bonero.context";
import { createBoneroClient } from "./util/bonero.client";
import type { BoneroConfig, BoneroPreloadData } from "./types";

interface BoneroProviderProps {
  children: ReactNode;
  apiKey: string;
  pixelId?: string;
  tagManagerId?: string;
  apiUrl?: string;
  preloadedData?: BoneroPreloadData;
}

export function BoneroProviderClient({ children, apiKey, apiUrl, pixelId, tagManagerId, preloadedData }: BoneroProviderProps) {
  const config = useMemo<BoneroConfig>(() => ({ apiKey, apiUrl }), [apiKey, apiUrl]);
  const client = useMemo(() => createBoneroClient(config), [config]);

  const [data, setData] = useState<BoneroPreloadData | null>(preloadedData ?? null);
  const [isLoading, setIsLoading] = useState(preloadedData === undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preloadedData) return;

    let cancelled = false;

    client
      .preloadSiteData()
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
  }, [client, preloadedData]);

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

  const showContent = contextValue.isReady;

  return (
    <BoneroContext.Provider value={contextValue}>
      {pixelId && tagManagerId ? <SiteAnalytics gtmId={tagManagerId} metaPixelId={pixelId} /> : null}
      {!showContent ? <BoneroLoading /> : null}
      {showContent ? children : null}
    </BoneroContext.Provider>
  );
}
