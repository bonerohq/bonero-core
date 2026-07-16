# @linqon/bonero-core

Bonero Customer API için React client paketi. Provider tabanlı dataset önbelleği ile makale, form ve dataset yönetimini tek yerden sağlar.

**API adresi:** `https://api.bonero.tr` (sabit — yalnızca local geliştirmede override edilir)

## Kurulum

```bash
npm install @linqon/bonero-core react react-dom
```

Next.js projelerinde analytics bileşenleri için `next` peer bağımlılığı önerilir.

## Hızlı başlangıç

### Provider

Uygulamayı `BoneroProvider` ile sarın. Provider API'den tüm dataset verilerini ve form listesini önceden yükler.

```tsx
// app/layout.tsx veya client wrapper
import { BoneroProvider } from "@linqon/bonero-core";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <BoneroProvider apiKey={process.env.NEXT_PUBLIC_BONERO_API_KEY!}>
      {children}
    </BoneroProvider>
  );
}
```

Alternatif import:

```tsx
import { BoneroProvider } from "@linqon/bonero-core/provider";
```

### Yapılandırma

| Alan | Zorunlu | Açıklama |
|---|---|---|
| `apiKey` | Evet | Tenant API anahtarı (`x-api-key` header) |
| `apiUrl` | Hayır | Yalnızca local test. Varsayılan: `https://api.bonero.tr` |
| `pixelId` | Hayır | Meta Pixel ID (analytics) |
| `tagManagerId` | Hayır | Google Tag Manager ID (analytics) |

Ortam değişkenleri:

| Değişken | Açıklama |
|---|---|
| `NEXT_PUBLIC_BONERO_API_KEY` | Client tarafı API anahtarı |
| `BONERO_API_KEY` | Server Components için API anahtarı |
| `BONERO_API_URL` / `NEXT_PUBLIC_BONERO_API_URL` | **Yalnızca local geliştirme** — örn. `http://localhost:6580` |

## Client API

### useBonero

Provider yüklendikten sonra dataset verilerine doğrudan erişin:

```tsx
"use client";

import { useBonero } from "@linqon/bonero-core";

export function SiteFooter() {
  const { dataSet, forms, isReady, isLoading, error } = useBonero();

  const youtubeUrl = dataSet.youtube?.get("url") as string | undefined;
  const team = dataSet.team?.items ?? [];

  return (/* ... */);
}
```

### useArticle

```tsx
import { useArticle } from "@linqon/bonero-core";

const article = useArticle();

const list = await article.fetch({ page: 1, limit: 10, type: "CONTENT" });
const post = await article.get("makale-slug");
const categories = await article.fetchCategories();
```

### useForm

Formlar doğrudan `https://api.bonero.tr` üzerinden gönderilir:

```tsx
import { useForm } from "@linqon/bonero-core";

const form = useForm();

const definition = await form.get("iletisim");
await form.submit("iletisim", { ad: "Ali", email: "ali@ornek.com" });
```

## Server API (Next.js)

```tsx
import {
  Bonero,
  getBoneroConfig,
  getArticles,
  getArticle,
  resolveInitialData,
} from "@linqon/bonero-core/server";

const config = getBoneroConfig({
  apiKey: process.env.BONERO_API_KEY,
});

export default async function Page() {
  const articles = await getArticles({ type: "CONTENT", page: 1, limit: 10 });
  return (/* ... */);
}
```

### Initial data (layout prefetch)

```tsx
import { Bonero } from "@linqon/bonero-core/server";

await Bonero.prepareInitialData(
  { apiKey: process.env.BONERO_API_KEY! },
  {
    faqs: { type: "dataset", source: "faqs" },
    blog: { type: "article", articleType: "CONTENT", take: 6 },
  },
);

const faqs = Bonero.dataSet.faqs;
```

## Export özeti

| Export | Açıklama |
|---|---|
| `BoneroProvider` | Dataset + form prefetch, opsiyonel analytics |
| `useBonero()` | `{ config, dataSet, forms, isReady, isLoading, error }` |
| `useArticle()` | Makale listesi / detay / kategoriler |
| `useForm()` | Form tanımı ve doğrudan gönderim |
| `useArticleCategory()` | Makale kategorileri |
| `BONERO_API_URL` | `https://api.bonero.tr` sabiti |

### Server (`@linqon/bonero-core/server`)

`Bonero`, `getBoneroConfig`, `getArticles`, `getArticle`, `resolveInitialData`, `generateBoneroSitemap` ve ilgili tipler — React hook'ları içermez.

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

**Tüketici proje** (`package.json` örneği — `leemes-nextjs-1` ile aynı desen):

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

## Lisans

MIT
