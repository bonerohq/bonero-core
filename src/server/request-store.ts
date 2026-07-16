import "server-only";

import { cache } from "react";
import { getBoneroConfig } from "../config";
import type { BoneroConfig, BoneroInitialDataConfig, BoneroResolvedInitialData } from "../types";
import { createDataSetAccessorMap } from "../utils/dataset-accessor";
import { createBoneroAccessor } from "./accessor";
import { resolveInitialData } from "./initial-data";

export type BoneroRequestStore = {
  config: BoneroConfig;
  initialData: BoneroResolvedInitialData;
  dataSet: ReturnType<typeof createDataSetAccessorMap>;
};

const loadBoneroRequestStore = cache(
  async (apiKey: string, schema: BoneroInitialDataConfig): Promise<BoneroRequestStore> => {
    const config = getBoneroConfig({ apiKey });
    const accessor = createBoneroAccessor(config);
    const [initialData, datasets] = await Promise.all([
      Object.keys(schema).length > 0
        ? resolveInitialData(config, schema)
        : Promise.resolve({} as BoneroResolvedInitialData),
      accessor.datasets(),
    ]);

    return {
      config,
      initialData,
      dataSet: createDataSetAccessorMap(datasets),
    };
  },
);

const getRequestStoreSlot = cache(() => ({ value: null as BoneroRequestStore | null }));

export async function resolveBoneroRequestStore(
  config: BoneroConfig,
  schema: BoneroInitialDataConfig = {},
): Promise<BoneroRequestStore> {
  const store = await loadBoneroRequestStore(config.apiKey, schema);
  getRequestStoreSlot().value = store;
  return store;
}

export function getBoneroRequestStore(): BoneroRequestStore | undefined {
  return getRequestStoreSlot().value ?? undefined;
}

export function setBoneroRequestStore(next: BoneroRequestStore): void {
  getRequestStoreSlot().value = next;
}
