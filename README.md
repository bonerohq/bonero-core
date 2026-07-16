# @linqon/bonero-core

Bonero Customer API için React ve Next.js istemci paketi. Provider tabanlı dataset önbelleği, makale yönetimi, form gönderimi, sunucu tarafı veri önbelleği (React `cache`) ve sitemap üretimi gibi özellikleri tek bir API altında birleştirir.

**Varsayılan API:** `https://api.bonero.tr` (yalnızca local geliştirmede override edilir)

## Özellikler

- **Tek provider, tüm site verisi:** `BoneroProvider` ile layout seviyesinde dataset, form ve isteğe bağlı analytics yüklenir.
- **Client hooks:** `useBonero`, `useArticle`, `useArticleCategory`, `useForm`.
- **Sunucu tarafı (Server Components / SSR):** `@linqon/bonero-core/server` altında `getArticles`, `getArticle`, `getArticleCategories`, `Bonero` accessor, `resolveInitialData` ve `generateBoneroSitemap`.
- **React `cache` ile otomatik deduplication:** Aynı render döngüsünde tekrarlayan API çağrıları tek seferde yapılır.
- **Initial data desteği:** Layout'tan `BoneroProvider`'a verilen şema, sunucuda çözülüp client context'e aktarılır. Sayfalar data çekmez, sadece context'ten okur.
- **Tip güvenliği:** TypeScript tipleri tüm API yüzeyinde dışa aktarılır.

## İçindekiler

- [Kurulum](#kurulum)
- [Hızlı başlangıç](#hızlı-başlangıç)
- [Yapılandırma](#yapılandırma)
- [Client API](#client-api)
  - [useBonero](#usebonero)
  - [useArticle](#usearticle)
  - [useArticleCategory](#usearticlecategory)
  - [useForm](#useform)
- [Server API](#server-api)
  - [getArticles / getArticle / getArticleCategories](#getarticles--getarticle--getarticlecategories)
  - [Bonero accessor](#bonero-accessor)
  - [resolveInitialData](#resolveinitialdata)
  - [generateBoneroSitemap](#generatebonerositemap)
- [Provider ve initial data akışı](#provider-ve-initial-data-akışı)
- [Dataset erişimi](#dataset-erişimi)
- [Analytics](#analytics)
- [Yaygın kullanım desenleri](#yaygın-kullanım-desenleri)
- [Geliştirme](#geliştirme)
- [Yayınlama](#yayınlama)
- [Lisans](#lisans)

## Kurulum

```bash
npm install @linqon/bonero-core react react-dom
```

Next.js projelerinde analytics bileşenleri için `next` peer bağımlılığı önerilir. Aşağıdaki paketler opsiyonel olarak peer bağımlılık olarak tanımlanmıştır:

```bash
npm install next @tanstack/react-query nuqs
```

## Hızlı başlangıç

### Provider ile uygulamayı sarma

`app/layout.tsx` (Server Component) içinde `BoneroProvider` kullanın. Bu bir async server component'tir.

```tsx
import { BoneroProvider } from "@linqon/bonero-core/provider";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <BoneroProvider apiKey={process.env.BONERO_API_KEY!}>
          {children}
        </BoneroProvider>
      </body>
    </html>
  );
}
```

> **Not:** `@linqon/bonero-core/provider` server-only entry point'tir ve yalnızca Server Component'lerde import edilmelidir.

Client-only uygulamalarda (örneğin bir CRA veya Vite projesi) doğrudan ana paketten import edilebilir:

```tsx
import { BoneroProvider } from "@linqon/bonero-core";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <BoneroProvider apiKey={process.env.VITE_BONERO_API_KEY!}>
      {children}
    </BoneroProvider>
  );
}
```

### Client component içinde veri okuma

```tsx
"use client";

import { useBonero } from "@linqon/bonero-core";

export function SiteFooter() {
  const { dataSet, forms, isReady, isLoading, error } = useBonero();

  if (!isReady) return null;

  const youtubeUrl = dataSet.youtube?.get("url") as string | undefined;
  const team = dataSet.team?.items ?? [];
  const contactForm = forms.find((f) => f.key === "iletisim");

  return (
    <footer>
      {team.map((member) => (
        <div key={member.slug}>{member.name}</div>
      ))}
      {youtubeUrl && <a href={youtubeUrl}>YouTube</a>}
    </footer>
  );
}
```

## Yapılandırma

### `BoneroProvider` props

| Prop | Tür | Zorunlu | Açıklama |
|---|---|---|---|
| `apiKey` | `string` | Evet | Tenant API anahtarı (`x-api-key` header) |
| `apiUrl` | `string` | Hayır | Yalnızca local test. Varsayılan: `https://api.bonero.tr` |
| `pixelId` | `string` | Hayır | Meta Pixel ID |
| `tagManagerId` | `string` | Hayır | Google Tag Manager ID |
| `initialData` | `BoneroInitialDataConfig` | Hayır | Layout seviyesinde sunucuda çözülecek veri şeması |

### Ortam değişkenleri

| Değişken | Açıklama |
|---|---|
| `BONERO_API_KEY` | Server Components ve build-time için API anahtarı |
| `NEXT_PUBLIC_BONERO_API_KEY` | Client tarafı API anahtarı |
| `BONERO_API_URL` / `NEXT_PUBLIC_BONERO_API_URL` | **Yalnızca local geliştirme** — örn. `http://localhost:6580` |
| `NEXT_PUBLIC_BONERO_META_PIXEL_ID` | Meta Pixel ID (ortam değişkeni olarak) |
| `NEXT_PUBLIC_BONERO_GTM_ID` | Google Tag Manager ID (ortam değişkeni olarak) |

## Client API

### `useBonero`

Provider yükledikten sonra dataset, form ve durum bilgilerine erişim sağlar.

```tsx
"use client";

import { useBonero } from "@linqon/bonero-core";

export function Header() {
  const { config, dataSet, forms, isReady, isLoading, error } = useBonero();

  if (isLoading) return <p>Yükleniyor…</p>;
  if (error) return <p>Hata: {error}</p>;
  if (!isReady) return null;

  const logo = dataSet.branding?.get("logo") as string | undefined;
  const nav = dataSet.navigation?.items ?? [];

  return (
    <header>
      {logo && <img src={logo} alt="Logo" />}
      <nav>{nav.map((item) => <a key={item.slug} href={`/${item.slug}`}>{item.title}</a>)}</nav>
    </header>
  );
}
```

Dönen değer:

| Alan | Tür | Açıklama |
|---|---|---|
| `config` | `BoneroConfig` | Aktif API anahtarı ve URL |
| `dataSet` | `Record<string, DataSetAccessor>` | Dataset erişim nesneleri |
| `forms` | `BoneroForm[]` | Ön yüklenmiş form tanımları |
| `isReady` | `boolean` | Veri yüklendi ve hata yok |
| `isLoading` | `boolean` | İlk yükleme devam ediyor |
| `error` | `string \| null` | Yükleme hatası mesajı |

### `useArticle`

Makale listesi, detay ve kategorileri client tarafında çeker.

```tsx
"use client";

import { useArticle } from "@linqon/bonero-core";

export function BlogList() {
  const article = useArticle();

  async function load() {
    const { data: list } = await article.fetch({ page: 1, limit: 10, type: "CONTENT" });
    const { data: post } = await article.get("makale-slug");
    const { data: categories } = await article.fetchCategories();
    return { list, post, categories };
  }

  // ...
}
```

Mevcut metotlar:

| Metot | Açıklama |
|---|---|
| `fetch(params?)` | Sayfalı makale listesi döner. `{ data: ArticlesPageResult }` |
| `get(slug)` | Tek makale döner. `{ data: BoneroArticle \| null }` |
| `fetchCategories()` | Makale kategorileri döner. `{ data: BoneroArticleCategory[] }` |

`ArticleFetchParams` alanları:

```ts
type ArticleFetchParams = {
  page?: number;
  limit?: number;
  perPage?: number; // limit alias
  take?: number;    // limit alias
  type?: "PROJECT" | "SERVICE" | "CONTENT";
  categorySlug?: string;
  search?: string;
  excludeSlug?: string;
};
```

### `useArticleCategory`

Yalnızca makale kategorilerine odaklanmış hook.

```tsx
"use client";

import { useArticleCategory } from "@linqon/bonero-core";

export function CategoryFilter() {
  const { fetch } = useArticleCategory();

  async function getCategories() {
    return await fetch();
  }
}
```

### `useForm`

Form tanımlarına erişim ve doğrudan API üzerinden form gönderimi.

```tsx
"use client";

import { useForm } from "@linqon/bonero-core";

export function ContactForm() {
  const form = useForm();

  async function handleSubmit(values: Record<string, unknown>) {
    await form.submit("iletisim", values);
  }

  return (
    <form onSubmit={(e) => handleSubmit(Object.fromEntries(new FormData(e.currentTarget)))}>
      {/* alanlar */}
    </form>
  );
}
```

Mevcut metotlar:

| Metot | Açıklama |
|---|---|
| `get(formKey)` | Ön yüklenmiş form tanımını döner. `{ data: BoneroForm \| null }` |
| `submit(formKey, values)` | Formu `/customer/forms/:key/submit` adresine POST eder. |
| `forms` | Tüm ön yüklenmiş form tanımları. |

## Server API

Tüm server API'leri `@linqon/bonero-core/server` altından import edilir.

```tsx
import { Bonero, getArticles, getArticle, generateBoneroSitemap } from "@linqon/bonero-core/server";
```

### `getArticles` / `getArticle` / `getArticleCategories`

Server Component'lerde veri çekmek için kullanılır. React `cache` ile sarmalanmıştır, aynı istek render döngüsünde tek sefer çalışır.

```tsx
// app/blog/page.tsx
import { getArticles, getArticleCategories } from "@linqon/bonero-core/server";

export default async function BlogPage() {
  const { articles, pagination } = await getArticles({ type: "CONTENT", page: 1, limit: 10 });
  const categories = await getArticleCategories();

  return (
    <main>
      {articles.map((article) => (
        <article key={article.slug}>
          <h2>{article.title}</h2>
        </article>
      ))}
    </main>
  );
}
```

```tsx
// app/blog/[slug]/page.tsx
import { getArticle } from "@linqon/bonero-core/server";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) return <div>Makale bulunamadı.</div>;

  return (
    <article>
      <h1>{article.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: article.content ?? "" }} />
    </article>
  );
}
```

### `Bonero` accessor

Gelişmiş sunucu tarafı erişim nesnesi. Daha düşük seviyeli API'ler sunar.

```tsx
import { Bonero } from "@linqon/bonero-core/server";

// Layout'ta BoneroProvider initialData verdiyse:
const latestBlog = Bonero.initialData.latestBlog?.articles;
const team = Bonero.dataSet.team?.items;

// Doğrudan accessor metotları:
const accessor = Bonero.accessor;
const allArticles = await accessor.allArticles("CONTENT");
const dataset = await accessor.dataset("branding");
const forms = await accessor.forms();
```

`Bonero` özellikleri:

| Özellik / Metot | Açıklama |
|---|---|
| `configure(config)` | Global config ve accessor'u ayarlar. |
| `accessor` | `BoneroAccessor` instance'ı döner. |
| `config` | Aktif config veya `null`. |
| `initialData` | Sunucuda çözülen initial data. Layout provider'ı gerektirir. |
| `dataSet` | Sunucuda çözülen dataset accessor map. |
| `registerInitialData(schema)` | Initial data şemasını kaydeder. |
| `prepareInitialData(config, schema)` | Şemayı sunucuda çözer. |

### `resolveInitialData`

Şema tabanlı veri çözümlemesi. Layout provider'ı kullanılmadan da manuel olarak çağrılabilir.

```tsx
import { resolveInitialData, getBoneroConfig } from "@linqon/bonero-core/server";

const config = getBoneroConfig({ apiKey: process.env.BONERO_API_KEY });

const initialData = await resolveInitialData(config, {
  latestBlog: {
    type: "article",
    articleType: "CONTENT",
    take: 3,
  },
  team: {
    type: "dataset",
    source: "team",
  },
});
```

Initial data şeması:

```ts
type BoneroInitialDataArticleEntry = {
  type: "article";
  articleType?: "PROJECT" | "SERVICE" | "CONTENT";
  category?: string;
  all?: boolean;      // true ise tüm makaleler çekilir
  take?: number;
  skip?: number;
};

type BoneroInitialDataDatasetEntry = {
  type: "dataset";
  source: string;       // dataset key
  where?: Record<string, string | number | boolean>;
  take?: number;
  skip?: number;
};

type BoneroInitialDataConfig = Record<string, BoneroInitialDataArticleEntry | BoneroInitialDataDatasetEntry>;
```

### `generateBoneroSitemap`

Makale listesinden Next.js `sitemap.ts` için entry dizisi üretir.

```tsx
// app/sitemap.ts
import { generateBoneroSitemap } from "@linqon/bonero-core/server";

export default async function sitemap() {
  return generateBoneroSitemap(
    { siteUrl: "https://www.ornek.com", staticPaths: ["/", "/hakkimizda", "/iletisim"] },
    { apiKey: process.env.BONERO_API_KEY },
  );
}
```

Dönen tip:

```ts
type SitemapEntry = {
  url: string;
  lastModified?: Date | string;
};
```

Makale URL kuralları:

| Makale tipi | URL |
|---|---|
| `CONTENT` | `/blog/:slug` |
| `PROJECT` | `/projeler/:slug` |
| `SERVICE` | yoksayılır (sitemap'e dahil edilmez) |

## Provider ve initial data akışı

1. `app/layout.tsx` içinde `BoneroProvider` bir `initialData` şeması alır.
2. `BoneroProvider` sunucuda:
   - `preloadSiteData()` ile dataset ve form verilerini çeker.
   - `Bonero.prepareInitialData(config, schema)` ile şemayı çözer.
3. Çözülen veriler `BoneroProviderClient` component'ine `preloadedData` olarak aktarılır.
4. Client component'ler `useBonero` ile `dataSet`, `forms` ve `initialData`'ya erişir.

Örnek layout:

```tsx
// app/layout.tsx
import { BoneroProvider } from "@linqon/bonero-core/provider";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <BoneroProvider
      apiKey={process.env.BONERO_API_KEY!}
      initialData={{
        latestBlog: { type: "article", articleType: "CONTENT", take: 3 },
        team: { type: "dataset", source: "team" },
      }}
    >
      {children}
    </BoneroProvider>
  );
}
```

Client component içinde initial data okuma:

```tsx
"use client";

import { useBonero } from "@linqon/bonero-core";

export function HomeBlog() {
  const { dataSet, initialData } = useBonero();
  const articles = initialData?.latestBlog?.articles ?? [];

  return (
    <section>
      {articles.map((article) => (
        <article key={article.slug}>{article.title}</article>
      ))}
    </section>
  );
}
```

> **Önemli:** `initialData` prop'u `BoneroProvider`'a verildikten sonra, sayfa component'leri veri çekmez. Sadece client component'ler context'ten okur. Bu sayede sayfalar tamamen statik ve hızlı render edilir.

## Dataset erişimi

`useBonero` ile dönen `dataSet` her dataset için bir `DataSetAccessor` içerir.

```ts
type DataSetAccessor = {
  items: DatasetItem[];
  key: string;
  title: string;
  description?: string | null;
  at(index: number): DatasetItem | undefined;
  filter(predicate: (item: DatasetItem) => boolean): DatasetItem[];
  get(field: string, index?: number): unknown;
};
```

Örnekler:

```tsx
const { dataSet } = useBonero();

// Tüm ekip üyeleri
const team = dataSet.team?.items ?? [];

// İlk üyenin adı
const firstName = dataSet.team?.get("name") as string | undefined;

// Sıralı ilk 5 öğe
const top5 = dataSet.team?.items.slice(0, 5);

// Filtreleme
const active = dataSet.team?.filter((member) => member.active === true);

// Belirli index
const second = dataSet.team?.at(1);
```

Server tarafında `Bonero.dataSet` veya `createDataSetAccessor` ile de erişilebilir:

```tsx
import { Bonero, createDataSetAccessor } from "@linqon/bonero-core/server";

const team = Bonero.dataSet.team?.items ?? [];
```

## Analytics

`pixelId` ve `tagManagerId` her ikisi de verildiğinde, `BoneroProvider` Google Tag Manager ve Meta Pixel script'lerini sayfaya ekler.

```tsx
// app/layout.tsx
import { BoneroProvider } from "@linqon/bonero-core/provider";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <BoneroProvider
      apiKey={process.env.BONERO_API_KEY!}
      pixelId={process.env.NEXT_PUBLIC_BONERO_META_PIXEL_ID}
      tagManagerId={process.env.NEXT_PUBLIC_BONERO_GTM_ID}
    >
      {children}
    </BoneroProvider>
  );
}
```

Analytics aktif olması için **her iki ID'nin de verilmesi** gerekir. Sadece biri verilirse script'ler eklenmez.

## Yaygın kullanım desenleri

### Client-only fetch (provider verisi olmadan)

```tsx
"use client";

import { useArticle } from "@linqon/bonero-core";

export function BlogList() {
  const article = useArticle();

  // useEffect / useQuery ile:
  // article.fetch({ type: "CONTENT" }).then(...)
}
```

### Sunucu + client hybrid

1. Sunucuda `getArticles` ile veri çek.
2. Client component'e prop olarak geç.
3. İnteraksiyon (sayfalama, filtre) için `useArticle` kullan.

```tsx
// app/blog/page.tsx
import { getArticles } from "@linqon/bonero-core/server";
import { BlogListClient } from "./BlogListClient";

export default async function BlogPage() {
  const { articles, pagination } = await getArticles({ type: "CONTENT", limit: 10 });
  return <BlogListClient initialArticles={articles} initialPagination={pagination} />;
}
```

```tsx
"use client";

import { useArticle } from "@linqon/bonero-core";
import { useState } from "react";

export function BlogListClient({ initialArticles, initialPagination }) {
  const [articles, setArticles] = useState(initialArticles);
  const article = useArticle();

  async function nextPage() {
    const { data } = await article.fetch({ type: "CONTENT", page: 2, limit: 10 });
    setArticles(data.articles);
  }
}
```

### Form tanımı ile dinamik form render

```tsx
"use client";

import { useForm } from "@linqon/bonero-core";

export function DynamicForm({ formKey }: { formKey: string }) {
  const form = useForm();
  const definition = form.get(formKey);

  if (!definition) return null;

  return (
    <form>
      {definition.fields.map((field) => (
        <label key={field.key}>
          {field.label}
          {field.type === "SELECT" ? (
            <select>
              {field.options?.map((option) => <option key={option}>{option}</option>)}
            </select>
          ) : (
            <input type={field.type === "BOOLEAN" ? "checkbox" : "text"} />
          )}
        </label>
      ))}
    </form>
  );
}
```

## Geliştirme

```bash
npm install
npm run build
npm run dev
npm run typecheck
```

### Yerel geliştirme (yalc)

`file:` bağımlılığı veya workspace link'i commit'lenmemeli; CI/CD ve diğer geliştiriciler npm registry sürümünü kullanmalı. Yerel `bonero-core` değişikliklerini tüketici projede test etmek için [yalc](https://github.com/wclr/yalc) kullanın.

**bonero-core** (bu repo):

```bash
npm run yalc:publish   # ilk kez yerel yalc store'a yayınla
npm run yalc:push      # değişiklikten sonra bağlı projelere gönder
npm run dev:yalc       # watch + her build sonrası otomatik push
```

**Tüketici proje** (`package.json` örneği):

```json
{
  "scripts": {
    "link:bonero-core": "yalc link @linqon/bonero-core",
    "unlink:bonero-core": "yalc remove @linqon/bonero-core && npm install @linqon/bonero-core@^0.4.0"
  },
  "dependencies": {
    "@linqon/bonero-core": "^0.4.0"
  },
  "devDependencies": {
    "yalc": "^1.0.0-pre.53"
  }
}
```

Tüketici `.gitignore` dosyasına ekleyin:

```
.yalc
yalc.lock
```

Yerel link:

```bash
npm run link:bonero-core
```

Registry sürümüne dön:

```bash
npm run unlink:bonero-core
```

> `yalc link` / `yalc remove` sonrası oluşan `package.json` ve `package-lock.json` değişikliklerini commit etmeyin.

## Yayınlama

```bash
npm run build
npm publish
```

Aynı sürümü yeniden yayınlayamazsınız. Her yayınlama öncesinde `package.json` içindeki `version` alanını artırmanız gerekir.

## Export özeti

### `@linqon/bonero-core`

| Export | Açıklama |
|---|---|
| `BoneroProvider` | Dataset + form prefetch, opsiyonel analytics |
| `useBonero()` | `{ config, dataSet, forms, isReady, isLoading, error }` |
| `useArticle()` | Makale listesi / detay / kategoriler |
| `useForm()` | Form tanımı ve doğrudan gönderim |
| `useArticleCategory()` | Makale kategorileri |
| `BONERO_API_URL` | `https://api.bonero.tr` sabiti |

### `@linqon/bonero-core/server`

- `Bonero`, `getBoneroConfig`
- `getArticles`, `getArticle`, `getArticleCategories`
- `createBoneroClient`, `createBoneroAccessor`, `getBoneroAccessor`
- `createDataSetAccessor`, `createDataSetAccessorMap`
- `resolveInitialData`
- `generateBoneroSitemap`, `buildSitemapFromArticles`
- Request store yönetimi: `getBoneroRequestStore`, `resolveBoneroRequestStore`, `registerBoneroInitialDataSchema`, vb.

### `@linqon/bonero-core/provider`

- `BoneroProvider` (server-only async component)

## Lisans

MIT
