import type {
  ArticleFetchParams,
  ArticlesPageResult,
  BoneroArticle,
  BoneroArticleCategory,
  BoneroArticleSummary,
  BoneroConfig,
  BoneroDatasetData,
  BoneroForm,
  BoneroPreloadData,
} from "../types";

const DEFAULT_API_URL = "https://api.bonero.tr";

function buildSearchParams(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  return search;
}

export function createBoneroClient(config: BoneroConfig) {
  const baseUrl = `${config.apiUrl ?? DEFAULT_API_URL}/customer`;

  async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        ...(init?.headers as Record<string, string> | undefined),
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Bonero API hatası (${response.status}): ${path}${body ? ` — ${body.slice(0, 200)}` : ""}`,
      );
    }

    return response.json() as Promise<T>;
  }

  return {
    fetchDatasetsWithData: () =>
      fetchJson<{ datasets: Record<string, BoneroDatasetData> }>("/datasets/with-data"),
    fetchForms: () => fetchJson<{ forms: BoneroForm[] }>("/forms"),
    fetchArticlesAll: () =>
      fetchJson<{ articles: BoneroArticleSummary[] }>("/articles/all"),
    fetchArticles: (params: ArticleFetchParams = {}) => {
      const search = buildSearchParams({
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        type: params.type,
        categorySlug: params.categorySlug,
        search: params.search,
      });
      return fetchJson<ArticlesPageResult>(`/articles?${search.toString()}`);
    },
    fetchArticle: (slug: string) => fetchJson<BoneroArticle>(`/articles/${slug}`),
    fetchArticleCategories: () =>
      fetchJson<{ categories: BoneroArticleCategory[] }>("/article-categories"),
    preloadSiteData: async (): Promise<BoneroPreloadData> => {
      const [datasetsResult, formsResult] = await Promise.all([
        fetchJson<{ datasets: Record<string, BoneroDatasetData> }>("/datasets/with-data"),
        fetchJson<{ forms: BoneroForm[] }>("/forms"),
      ]);

      return {
        datasets: datasetsResult.datasets,
        forms: formsResult.forms,
      };
    },
  };
}
