"use client";

import {
  QueryClient,
  QueryClientProvider,
  useQueries,
} from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useMemo, useState, type ReactNode } from "react";
import { BONERO_QUERY_STALE_TIME } from "./constants.js";
import {
  fetchDatasetData,
  fetchDatasetList,
  fetchForms,
  resolveBoneroConfig,
} from "./client.js";
import { BoneroContextProvider } from "./context.js";
import { boneroKeys } from "./query-keys.js";
import { buildDataSetStore } from "./utils/dataset-accessor.js";
import type { BoneroProviderProps, DatasetData } from "./types.js";

function BoneroDataLoader({
  children,
  config,
}: {
  children: ReactNode;
  config: ReturnType<typeof resolveBoneroConfig>;
}) {
  const hasApiKey = Boolean(config.apiKey);

  const listQuery = useQueries({
    queries: [
      {
        queryKey: boneroKeys.datasets.list(),
        queryFn: () => fetchDatasetList(config),
        staleTime: BONERO_QUERY_STALE_TIME,
        enabled: hasApiKey,
      },
      {
        queryKey: boneroKeys.forms.list(),
        queryFn: () => fetchForms(config),
        staleTime: BONERO_QUERY_STALE_TIME,
        enabled: hasApiKey,
      },
    ],
  });

  const resolvedKeys = useMemo(() => {
    const datasets = listQuery[0]?.data?.datasets ?? [];
    return datasets
      .map((dataset) => dataset.key)
      .filter((key): key is string => Boolean(key));
  }, [listQuery[0]?.data]);

  const datasetQueries = useQueries({
    queries: resolvedKeys.map((key) => ({
      queryKey: boneroKeys.datasets.data(key),
      queryFn: () => fetchDatasetData(config, key),
      staleTime: BONERO_QUERY_STALE_TIME,
      enabled: hasApiKey && resolvedKeys.length > 0,
    })),
  });

  const datasets = useMemo(() => {
    const map: Record<string, DatasetData> = {};
    resolvedKeys.forEach((key, index) => {
      const data = datasetQueries[index]?.data;
      if (data) map[key] = data;
    });
    return map;
  }, [resolvedKeys, datasetQueries]);

  const isLoading =
    listQuery.some((query) => query.isLoading) ||
    datasetQueries.some((query) => query.isLoading);

  const isReady =
    !hasApiKey ||
    (listQuery.every((query) => query.isSuccess) &&
      (resolvedKeys.length === 0 ||
        datasetQueries.every((query) => query.isSuccess || query.isError)));

  const dataSet = useMemo(
    () => buildDataSetStore(datasets, { isLoading, isReady }),
    [datasets, isLoading, isReady],
  );

  const value = useMemo(
    () => ({
      config,
      dataSet,
    }),
    [config, dataSet],
  );

  return (
    <BoneroContextProvider value={value}>{children}</BoneroContextProvider>
  );
}

export function BoneroProvider({
  children,
  apiKey,
  apiUrl,
}: BoneroProviderProps) {
  const config = useMemo(
    () => resolveBoneroConfig({ apiKey, apiUrl }),
    [apiKey, apiUrl],
  );

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: BONERO_QUERY_STALE_TIME,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <BoneroDataLoader config={config}>{children}</BoneroDataLoader>
      </NuqsAdapter>
    </QueryClientProvider>
  );
}
