import { cache } from "react";
import { getBoneroConfig } from "../config";
import { createBoneroClient } from "../util/bonero.client";
import type { ArticleFetchParams, BoneroArticle, BoneroArticleCategory, ArticlesPageResult } from "../types";
import { Bonero } from "./bonero";
import { applyBoneroNoCachePolicy } from "./no-cache";
import { getBoneroRequestStore } from "./request-store";

function client() {
  const config =
    Bonero.config ?? getBoneroRequestStore()?.config ?? getBoneroConfig();
  return createBoneroClient(config);
}

/** SSR — paginated makale listesi */
export async function getArticles(params: ArticleFetchParams = {}): Promise<ArticlesPageResult> {
  await applyBoneroNoCachePolicy();
  const { perPage, take, limit, ...rest } = params;
  return client().fetchArticles({
    ...rest,
    limit: limit ?? perPage ?? take,
  });
}

/** SSR — tek makale */
export const getArticle = cache(async (slug: string): Promise<BoneroArticle | null> => {
  await applyBoneroNoCachePolicy();
  try {
    return await client().fetchArticle(slug);
  } catch {
    return null;
  }
});

/** SSR — makale kategorileri */
export const getArticleCategories = cache(async (): Promise<BoneroArticleCategory[]> => {
  await applyBoneroNoCachePolicy();
  try {
    const { categories } = await client().fetchArticleCategories();
    return categories;
  } catch {
    return [];
  }
});
