import type { ReactNode } from "react";

export type BoneroConfig = {
  apiUrl: string;
  tenantHost: string;
  revalidateSeconds?: number;
};

export type BoneroFetchOptions = {
  revalidate?: number | false;
  cache?: RequestCache;
};

export type DatasetItem = Record<string, unknown> & {
  key?: string;
  sortOrder?: number;
};

export type DatasetData = {
  key: string;
  title: string;
  description?: string | null;
  items: DatasetItem[];
};

export type DatasetMeta = {
  id: string;
  title: string;
  key?: string | null;
  description?: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

export type DatasetListResponse = {
  datasets: DatasetMeta[];
};

export type FormField = {
  key: string;
  label: string;
  type: "TEXT" | "BOOLEAN" | "SELECT";
  required: boolean;
  placeholder?: string | null;
  description?: string | null;
  options?: string[];
};

export type BoneroForm = {
  id: string;
  key: string;
  title: string;
  fields: FormField[];
};

export type FormsListResponse = {
  forms: BoneroForm[];
};

export type ArticleCategory = {
  id: string;
  name: string;
  slug: string;
};

export type BoneroArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImageUrl?: string | null;
  metadata?: Record<string, unknown> | null;
  type: "PROJECT" | "SERVICE" | "CONTENT";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt?: string | null;
  categoryId?: string | null;
  category?: ArticleCategory | null;
};

export type ArticleFetchParams = {
  page?: number;
  limit?: number;
  amount?: number;
  type?: BoneroArticle["type"];
  categorySlug?: string;
  search?: string;
};

export type ArticlesListResponse = {
  articles: BoneroArticle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ArticleCategoriesResponse = {
  categories: Array<ArticleCategory & { description?: string | null; lessonCount?: number }>;
};

export type SubmitFormOptions = {
  /** İstemci tarafında proxy endpoint (örn. /api/forms/submit) */
  proxyUrl?: string;
};

export type BoneroProviderProps = {
  children: ReactNode;
  apiUrl?: string;
  tenantHost?: string;
  revalidateSeconds?: number;
  /** TanStack Query staleTime (ms). Varsayılan: 60_000 */
  staleTime?: number;
  /** Form gönderimi için istemci proxy URL'i */
  formSubmitProxyUrl?: string;
  /** Prefetch edilecek dataset anahtarları. Boşsa API'den tümü çekilir. */
  datasetKeys?: string[];
};

export type DataSetAccessor = {
  readonly items: DatasetItem[];
  readonly key: string;
  readonly title: string;
  readonly description?: string | null;
  at(index: number): DatasetItem | undefined;
  filter(predicate: (item: DatasetItem) => boolean): DatasetItem[];
  get(field: string, index?: number): unknown;
};

export type DataSetStore = Record<string, DataSetAccessor> & {
  readonly keys: string[];
  readonly isLoading: boolean;
  readonly isReady: boolean;
};
