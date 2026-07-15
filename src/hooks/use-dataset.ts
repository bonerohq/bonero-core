"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { fetchDatasetData, resolveBoneroConfig } from "../client.js";
import { useBoneroContext } from "../context.js";
import { boneroKeys } from "../query-keys.js";
import {
  aliasToDatasetKey,
  createDataSetAccessor,
  datasetKeyToAlias,
} from "../utils/dataset-accessor.js";
import type { DataSetAccessor } from "../types.js";

function useDatasetQuery(
  config: ReturnType<typeof resolveBoneroConfig>,
  resolvedKey: string | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: boneroKeys.datasets.data(resolvedKey ?? ""),
    queryFn: () => fetchDatasetData(config, resolvedKey!),
    enabled: enabled && Boolean(resolvedKey),
    select: createDataSetAccessor,
  });
}

export function useDataSet(key?: string) {
  const { config, dataSet } = useBoneroContext();
  const queryClient = useQueryClient();

  const resolveKey = useCallback(
    (input: string) => {
      if (
        input in dataSet &&
        input !== "keys" &&
        input !== "isLoading" &&
        input !== "isReady"
      ) {
        const direct = dataSet[input];
        if (direct && "items" in direct) return input;
      }
      return aliasToDatasetKey(input);
    },
    [dataSet],
  );

  const resolvedKey = useMemo(
    () => (key ? resolveKey(key) : undefined),
    [key, resolveKey],
  );

  const query = useDatasetQuery(config, resolvedKey, Boolean(key));

  const get = useCallback(
    async (input: string): Promise<DataSetAccessor> => {
      const resolved = resolveKey(input);

      const cached = dataSet[resolved];
      if (cached && "items" in cached) {
        return cached;
      }

      const data = await queryClient.fetchQuery({
        queryKey: boneroKeys.datasets.data(resolved),
        queryFn: () => fetchDatasetData(config, resolved),
      });

      return createDataSetAccessor(data);
    },
    [config, dataSet, queryClient, resolveKey],
  );

  if (key) {
    const accessor =
      dataSet[resolvedKey!] ?? dataSet[datasetKeyToAlias(resolvedKey!)];

    return {
      ...accessor,
      items: accessor?.items ?? query.data?.items ?? [],
      isLoading: dataSet.isLoading || query.isLoading,
      isError: query.isError,
      error: query.error,
      refetch: query.refetch,
      get,
    };
  }

  return {
    ...dataSet,
    get,
  };
}
