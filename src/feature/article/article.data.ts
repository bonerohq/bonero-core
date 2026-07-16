import { getArticle, getArticleCategories, getArticles } from "../../server/article";
import type { ArticleFetchParams, BoneroArticle, BoneroArticleCategory } from "../../types";

export type ArticlePageParams = ArticleFetchParams;

export { getArticle, getArticleCategories, getArticles, type BoneroArticle, type BoneroArticleCategory };
