export type BoneroConfig = {
  apiKey: string;
  apiUrl?: string;
};

/** Sitemap için hafif makale özeti — `/articles/all` */
export type BoneroArticleSummary = {
  slug: string;
  title: string;
  excerpt?: string | null;
  type: "PROJECT" | "SERVICE" | "CONTENT";
  createdAt: string;
  updatedAt: string;
};

export type BoneroArticleCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  lessonCount?: number;
};

/** Paginated liste ve detay — `/articles`, `/articles/:slug` */
export type BoneroArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string;
  coverImageUrl?: string | null;
  metadata?: Record<string, unknown> | null;
  type: "PROJECT" | "SERVICE" | "CONTENT";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt?: string | null;
  categoryId?: string | null;
  category?: BoneroArticleCategory | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ArticleFetchParams = {
  page?: number;
  limit?: number;
  type?: BoneroArticle["type"];
  categorySlug?: string;
  search?: string;
};

export type ArticlesPageResult = {
  articles: BoneroArticle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type BoneroForm = {
  id: string;
  key: string;
  title: string;
  fields: Array<{
    key: string;
    label: string;
    type: "TEXT" | "BOOLEAN" | "SELECT";
    required: boolean;
    placeholder?: string | null;
    description?: string | null;
    options?: string[];
  }>;
};

export type BoneroDatasetData = {
  key: string;
  title: string;
  description?: string | null;
  items: Array<Record<string, unknown>>;
};

export type BoneroPreloadData = {
  datasets: Record<string, BoneroDatasetData>;
  forms: BoneroForm[];
};

export type DatasetItem = Record<string, unknown>;

export type DataSetAccessor = {
  items: DatasetItem[];
  key: string;
  title: string;
  description?: string | null;
  at(index: number): DatasetItem | undefined;
  filter(predicate: (item: DatasetItem) => boolean): DatasetItem[];
  get(field: string, index?: number): unknown;
};

export type BoneroInitialDataDatasetEntry = {
  type: "dataset";
  source: string;
  where?: Record<string, string | number | boolean>;
  take?: number;
  skip?: number;
};

export type BoneroInitialDataArticleEntry = {
  type: "article";
  articleType?: BoneroArticle["type"];
  category?: string;
  all?: boolean;
  take?: number;
  skip?: number;
};

export type BoneroInitialDataEntry = BoneroInitialDataDatasetEntry | BoneroInitialDataArticleEntry;

export type BoneroInitialDataConfig = Record<string, BoneroInitialDataEntry>;

export type BoneroResolvedArticleData = {
  articles: BoneroArticle[];
  pagination?: ArticlesPageResult["pagination"];
};

export type BoneroResolvedInitialData<T extends BoneroInitialDataConfig = BoneroInitialDataConfig> = {
  [K in keyof T]: T[K] extends BoneroInitialDataArticleEntry
    ? BoneroResolvedArticleData
    : DataSetAccessor;
};
