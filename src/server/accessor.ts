import { cache } from "react";
import { getBoneroConfig } from "../config";
import type {
  ArticleFetchParams,
  ArticlesPageResult,
  BoneroArticle,
  BoneroArticleCategory,
  BoneroConfig,
  BoneroDatasetData,
  BoneroForm,
  DatasetItem,
} from "../types";
import { createBoneroClient } from "../util/bonero.client";

const MAX_PAGES = 100;

export type BoneroAccessor = {
  datasets(): Promise<Record<string, BoneroDatasetData>>;
  dataset(key: string): Promise<BoneroDatasetData | null>;
  datasetItems(key: string): Promise<DatasetItem[]>;
  form(key: string): Promise<BoneroForm | null>;
  forms(): Promise<BoneroForm[]>;
  articles(params?: ArticleFetchParams): Promise<ArticlesPageResult>;
  allArticles(type: BoneroArticle["type"], limit?: number): Promise<BoneroArticle[]>;
  article(slug: string): Promise<BoneroArticle | null>;
  articleCategories(): Promise<BoneroArticleCategory[]>;
};

async function safeArticles(
  config: BoneroConfig,
  params: ArticleFetchParams,
): Promise<ArticlesPageResult> {
  try {
    return await createBoneroClient(config).fetchArticles(params);
  } catch {
    return { articles: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
  }
}

async function fetchAllArticlesOfType(
  config: BoneroConfig,
  type: BoneroArticle["type"],
  limit = 50,
): Promise<BoneroArticle[]> {
  const first = await safeArticles(config, { type, limit, page: 1 });
  const totalPages = Math.min(
    Math.max(
      1,
      Number.isFinite(Number(first.pagination?.totalPages)) ? Number(first.pagination.totalPages) : 1,
    ),
    MAX_PAGES,
  );

  if (totalPages === 1) return first.articles;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      safeArticles(config, { type, limit, page: index + 2 }),
    ),
  );

  return [first, ...rest].flatMap((result) => result.articles);
}

async function fetchAllDatasetsSafe(config: BoneroConfig): Promise<Record<string, BoneroDatasetData>> {
  try {
    const { datasets } = await createBoneroClient(config).fetchDatasetsWithData();
    return datasets;
  } catch {
    return {};
  }
}

export function createBoneroAccessor(config: BoneroConfig): BoneroAccessor {
  const allDatasets = cache(() => fetchAllDatasetsSafe(config));
  const allArticlesByType = cache((type: BoneroArticle["type"]) =>
    fetchAllArticlesOfType(config, type),
  );

  return {
    datasets: allDatasets,
    dataset: cache(async (key) => (await allDatasets())[key] ?? null),
    datasetItems: cache(async (key) => (await allDatasets())[key]?.items ?? []),
    form: cache(async (key) => {
      try {
        const { forms } = await createBoneroClient(config).fetchForms();
        return forms.find((form) => form.key === key) ?? null;
      } catch {
        return null;
      }
    }),
    forms: cache(async () => {
      try {
        const { forms } = await createBoneroClient(config).fetchForms();
        return forms;
      } catch {
        return [];
      }
    }),
    articles: cache((params: ArticleFetchParams = {}) => safeArticles(config, params)),
    allArticles: allArticlesByType,
    article: cache(async (slug) => {
      try {
        return await createBoneroClient(config).fetchArticle(slug);
      } catch {
        return null;
      }
    }),
    articleCategories: cache(async () => {
      try {
        const { categories } = await createBoneroClient(config).fetchArticleCategories();
        return categories;
      } catch {
        return [];
      }
    }),
  };
}

export function getBoneroAccessor(config?: Partial<BoneroConfig>): BoneroAccessor {
  return createBoneroAccessor(getBoneroConfig(config));
}
