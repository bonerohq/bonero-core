"use client";

import {
  QueryClient,
  QueryClientProvider,
  useQueries,
} from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useMemo, useState, type ReactNode } from "react";
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
  formSubmitProxyUrl,
  datasetKeys,
  staleTime,
}: {
  children: ReactNode;
  config: ReturnType<typeof resolveBoneroConfig>;
  formSubmitProxyUrl?: string;
  datasetKeys?: string[];
  staleTime: number;
}) {
  const listQuery = useQueries({
    queries: [
      {
        queryKey: boneroKeys.datasets.list(),
        queryFn: () => fetchDatasetList(config),
        staleTime,
      },
      {
        queryKey: boneroKeys.forms.list(),
        queryFn: () => fetchForms(config),
        staleTime,
      },
    ],
  });

  const resolvedKeys = useMemo(() => {
    const fromApi =
      listQuery[0]?.data?.datasets
        ?.map((dataset) => dataset.key)
        .filter((key): key is string => Boolean(key)) ?? [];

    const merged = new Set<string>([...(datasetKeys ?? []), ...fromApi]);
    return [...merged];
  }, [datasetKeys, listQuery[0]?.data]);

  const datasetQueries = useQueries({
    queries: resolvedKeys.map((key) => ({
      queryKey: boneroKeys.datasets.data(key),
      queryFn: () => fetchDatasetData(config, key),
      staleTime,
      enabled: resolvedKeys.length > 0,
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
    listQuery.every((query) => query.isSuccess) &&
    (resolvedKeys.length === 0 ||
      datasetQueries.every((query) => query.isSuccess || query.isError));

  const dataSet = useMemo(
    () => buildDataSetStore(datasets, { isLoading, isReady }),
    [datasets, isLoading, isReady],
  );

  const value = useMemo(
    () => ({
      config,
      formSubmitProxyUrl,
      dataSet,
    }),
    [config, formSubmitProxyUrl, dataSet],
  );

  return (
    <BoneroContextProvider value={value}>{children}</BoneroContextProvider>
  );
}

export function BoneroProvider({
  children,
  apiUrl,
  tenantHost,
  revalidateSeconds,
  staleTime = 60_000,
  formSubmitProxyUrl,
  datasetKeys,
}: BoneroProviderProps) {
  const config = useMemo(
    () => resolveBoneroConfig({ apiUrl, tenantHost, revalidateSeconds }),
    [apiUrl, tenantHost, revalidateSeconds],
  );

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <BoneroDataLoader
          config={config}
          formSubmitProxyUrl={formSubmitProxyUrl}
          datasetKeys={datasetKeys}
          staleTime={staleTime}
        >
          {children}
        </BoneroDataLoader>
      </NuqsAdapter>
    </QueryClientProvider>
  );
}
