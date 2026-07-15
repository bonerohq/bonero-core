import type { ArticleFetchParams } from "./types.js";

export const boneroKeys = {
  all: ["bonero"] as const,
  datasets: {
    all: ["bonero", "datasets"] as const,
    list: () => [...boneroKeys.datasets.all, "list"] as const,
    data: (key: string) => [...boneroKeys.datasets.all, "data", key] as const,
  },
  forms: {
    all: ["bonero", "forms"] as const,
    list: () => [...boneroKeys.forms.all, "list"] as const,
    detail: (key: string) => [...boneroKeys.forms.all, "detail", key] as const,
  },
  articles: {
    all: ["bonero", "articles"] as const,
    list: (params: ArticleFetchParams = {}) =>
      [...boneroKeys.articles.all, "list", params] as const,
    detail: (slug: string) =>
      [...boneroKeys.articles.all, "detail", slug] as const,
    categories: () => [...boneroKeys.articles.all, "categories"] as const,
  },
};
