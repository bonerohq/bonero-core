"use client";

import { createContext, useContext, useMemo } from "react";
import type { BoneroConfig, BoneroPreloadData, DataSetAccessor } from "../types";
import { createDataSetAccessorMap } from "../utils/dataset-accessor";

export type BoneroContextValue = {
  config: BoneroConfig;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  data: BoneroPreloadData | null;
};

export const BoneroContext = createContext<BoneroContextValue | null>(null);

export function useBoneroContext(): BoneroContextValue {
  const context = useContext(BoneroContext);
  if (!context) {
    throw new Error("useBoneroContext BoneroProvider içinde kullanılmalıdır.");
  }
  return context;
}

export function useBonero() {
  const { config, data, isReady, isLoading, error } = useBoneroContext();
  const dataSet = useMemo<Record<string, DataSetAccessor>>(
    () => createDataSetAccessorMap(data?.datasets ?? {}),
    [data?.datasets],
  );

  return {
    config,
    dataSet,
    forms: data?.forms ?? [],
    isReady,
    isLoading,
    error,
  };
}
