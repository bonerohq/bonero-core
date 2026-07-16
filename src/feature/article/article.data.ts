import { cache } from "react";
import { getArticle, getArticleCategories, getArticles } from "../../server/article";
import type { ArticleFetchParams, BoneroArticle, BoneroArticleCategory } from "../../types";

export const ARTICLES_PER_PAGE = 9;

export type ArticlePageData = {
  articles: BoneroArticle[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  categorySlug?: string;
};

export type ArticlePageParams = ArticleFetchParams & {
  perPage?: number;
};

export async function getArticlePage({
  page = 1,
  perPage = ARTICLES_PER_PAGE,
  type,
  categorySlug,
  search,
}: ArticlePageParams): Promise<ArticlePageData> {
  const result = await getArticles({
    type,
    page,
    limit: perPage,
    categorySlug,
    search,
  });

  return {
    articles: result.articles,
    currentPage: result.pagination.page,
    totalPages: result.pagination.totalPages,
    totalItems: result.pagination.total,
    perPage,
    categorySlug,
  };
}

export const getArticleBySlug = cache(
  async (slug: string, type?: BoneroArticle["type"]): Promise<BoneroArticle | null> => {
    const article = await getArticle(slug);
    if (!article) return null;
    if (type && article.type !== type) return null;
    return article;
  },
);

export async function getLatestArticles(
  type: BoneroArticle["type"],
  count: number,
): Promise<BoneroArticle[]> {
  const result = await getArticles({ type, page: 1, limit: count });
  return result.articles;
}

export async function getRecommendedArticles(
  type: BoneroArticle["type"],
  currentSlug: string,
  count = 3,
  categorySlug?: string,
): Promise<BoneroArticle[]> {
  if (categorySlug) {
    const sameCategory = await getArticles({
      type,
      limit: count + 1,
      page: 1,
      categorySlug,
    });

    const recommended = sameCategory.articles.filter((article) => article.slug !== currentSlug);
    if (recommended.length >= count) return recommended.slice(0, count);
  }

  const latest = await getArticles({ type, limit: count + 5, page: 1 });
  return latest.articles.filter((article) => article.slug !== currentSlug).slice(0, count);
}

export { getArticleCategories, getArticles, type BoneroArticleCategory };
