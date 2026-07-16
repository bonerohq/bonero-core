"use client";

import { useMemo } from "react";
import { useBoneroContext } from "../../context/bonero.context";
import { createBoneroClient } from "../../util/bonero.client";
import type { ArticleFetchParams } from "../../types";

export function useArticle() {
  const { config } = useBoneroContext();
  const client = useMemo(() => createBoneroClient(config), [config]);

  return {
    fetch: (params?: ArticleFetchParams) => client.fetchArticles(params),
    get: (slug: string) => client.fetchArticle(slug),
    fetchCategories: () => client.fetchArticleCategories(),
  };
}
