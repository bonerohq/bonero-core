export { BoneroProvider } from "./provider.js";
export { useBonero } from "./hooks/use-bonero.js";
export { useArticle } from "./hooks/use-article.js";
export type { ArticleFetchParams, BoneroArticle } from "./hooks/use-article.js";
export { useDataSet } from "./hooks/use-dataset.js";
export { useForm } from "./hooks/use-form.js";
export type { BoneroForm } from "./hooks/use-form.js";

export {
  boneroFetch,
  fetchArticleBySlug,
  fetchArticleCategories,
  fetchArticles,
  fetchDatasetData,
  fetchDatasetList,
  fetchFormByKey,
  fetchForms,
  getFormSubmitUrl,
  resolveBoneroConfig,
  submitFormDirect,
  submitFormViaProxy,
} from "./client.js";

export { boneroKeys } from "./query-keys.js";
export {
  aliasToDatasetKey,
  createDataSetAccessor,
  datasetKeyToAlias,
} from "./utils/dataset-accessor.js";

export type {
  ArticleCategoriesResponse,
  ArticlesListResponse,
  BoneroConfig,
  BoneroFetchOptions,
  BoneroProviderProps,
  DataSetAccessor,
  DataSetStore,
  DatasetData,
  DatasetItem,
  DatasetMeta,
  FormField,
  SubmitFormOptions,
} from "./types.js";
