import "server-only";

import type {
  BoneroConfig,
  BoneroInitialDataConfig,
  BoneroResolvedInitialData,
  DataSetAccessor,
} from "../types";
import { getBoneroConfig } from "../config";
import { createBoneroAccessor, type BoneroAccessor } from "./accessor";
import {
  getBoneroRequestStore,
  registerBoneroInitialDataSchema,
  resolveBoneroRequestStore,
  type BoneroRequestStore,
} from "./request-store";

let currentConfig: BoneroConfig | null = null;
let currentAccessor: BoneroAccessor | null = null;

function ensureConfigured(): BoneroConfig {
  if (!currentConfig) {
    currentConfig = getBoneroConfig();
  }
  return currentConfig;
}

export const Bonero = {
  configure(config: BoneroConfig): void {
    currentConfig = config;
    currentAccessor = createBoneroAccessor(config);
  },

  get accessor(): BoneroAccessor {
    if (!currentAccessor) {
      currentAccessor = createBoneroAccessor(ensureConfigured());
    }
    return currentAccessor;
  },

  get config(): BoneroConfig | null {
    return currentConfig;
  },

  /**
   * Layout'taki BoneroProvider'ın resolve ettiği initial data.
   * Senkron — provider prepare etmeden erişilirse hata fırlatır.
   * Sayfada: `const { latestBlog } = Bonero.initialData`
   */
  get initialData(): BoneroResolvedInitialData {
    const requestStore = getBoneroRequestStore();
    if (!requestStore) {
      throw new Error(
        "Bonero.initialData hazır değil. Layout'ta <BoneroProvider initialData={...}> kullanın.",
      );
    }
    return requestStore.initialData;
  },

  get dataSet(): Record<string, DataSetAccessor> {
    const requestStore = getBoneroRequestStore();
    if (!requestStore) {
      throw new Error(
        "Bonero.dataSet hazır değil. Layout'ta <BoneroProvider initialData={...}> kullanın.",
      );
    }
    return requestStore.dataSet;
  },

  registerInitialData(schema: BoneroInitialDataConfig): void {
    registerBoneroInitialDataSchema(schema);
  },

  async prepareInitialData(
    config: BoneroConfig,
    schema: BoneroInitialDataConfig = {},
  ): Promise<BoneroRequestStore> {
    Bonero.configure(config);
    return resolveBoneroRequestStore(config, schema);
  },

  resolveRequestStore(
    config: BoneroConfig,
    schema: BoneroInitialDataConfig = {},
  ): Promise<BoneroRequestStore> {
    return resolveBoneroRequestStore(config, schema);
  },

  reset(): void {
    currentConfig = null;
    currentAccessor = null;
  },
};
