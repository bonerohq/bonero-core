"use client";

import { createContext, useContext } from "react";
import type { BoneroConfig, DataSetStore } from "./types.js";

export type BoneroContextValue = {
  config: BoneroConfig;
  dataSet: DataSetStore;
};

const BoneroContext = createContext<BoneroContextValue | null>(null);

export function BoneroContextProvider({
  value,
  children,
}: {
  value: BoneroContextValue;
  children: React.ReactNode;
}) {
  return (
    <BoneroContext.Provider value={value}>{children}</BoneroContext.Provider>
  );
}

export function useBoneroContext(): BoneroContextValue {
  const context = useContext(BoneroContext);
  if (!context) {
    throw new Error("useBoneroContext BoneroProvider içinde kullanılmalıdır.");
  }
  return context;
}
