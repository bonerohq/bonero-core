"use client";

import { useMemo } from "react";
import { useBoneroContext } from "../../context/bonero.context";
import { createBoneroClient } from "../../util/bonero.client";
import type { BoneroArticleCategory } from "../../types";

export function useArticleCategory() {
  const { config } = useBoneroContext();
  const client = useMemo(() => createBoneroClient(config), [config]);

  return {
    fetch: async (): Promise<BoneroArticleCategory[]> => {
      const { categories } = await client.fetchArticleCategories();
      return categories;
    },
  };
}
