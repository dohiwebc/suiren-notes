# Suiren Notes（Astro版）

TikTokでは話しきれないことを、ゆっくり書く個人ブログ **Suiren Notes** の Astro プロジェクトです。

microCMS の記事を **ビルド時に静的 HTML として生成**し、SEO・AdSense 審査に配慮した構成になっています。

## 技術スタック

- [Astro](https://astro.build/)（静的サイト生成）
- [microCMS](https://microcms.io/)（コンテンツ管理）
- [Cloudflare Pages](https://pages.cloudflare.com/)（ホスティング想定）

## セットアップ

```bash
npm install
cp .env.example .env
# .env に microCMS の接続情報を設定
npm run dev
```

## 環境変数

| 変数名 | 説明 |
|--------|------|
| `MICROCMS_SERVICE_DOMAIN` | microCMS のサービスドメイン（例: `suiren`） |
| `MICROCMS_API_KEY` | microCMS API キー（GET 専用・公開コンテンツ用を推奨） |
| `PUBLIC_SITE_URL` | 本番 URL（canonical・OGP・sitemap 用。既定: `https://suiren-notes.pages.dev`） |

`.env` は Git にコミットしないでください。

## microCMS の設定

### API 名

| 用途 | エンドポイント名 |
|------|------------------|
| ブログ記事 | `blog` |
| プロフィール | `profile` |
| 制作実績 | `works` |
| サイト設定 | `site-settings` |

### slug フィールド（必須推奨）

記事 URL を `/articles/[slug]/` 形式にするため、**blog API に `slug` フィールド（テキスト）を追加**してください。

例:

- `n-high-report` → `/articles/n-high-report/`
- `why-i-chose-n-high-school` → `/articles/why-i-chose-n-high-school/`

`slug` が未設定の記事は **ビルド時に id を代替**として使用し、コンソールに警告を出力します（ビルドは失敗しません）。

## ページ構成

| URL | 説明 |
|-----|------|
| `/` | トップページ |
| `/blog/` | 記事一覧 |
| `/blog/category/[category]/` | カテゴリ別一覧 |
| `/articles/[slug]/` | 記事詳細（静的生成） |
| `/article/?id=xxx` | 旧 URL（新 URL へリダイレクト） |
| `/about/` | プロフィール |
| `/works/` | 制作実績 |
| `/privacy/` | プライバシーポリシー |
| `/rss.xml` | RSS フィード |
| `/sitemap-index.xml` | サイトマップ（自動生成） |

## ビルド

```bash
npm run build
```

出力先: `dist/`

記事ごとの HTML は `dist/articles/[slug]/index.html` として生成されます。

## 本番 URL

https://suiren-notes.pages.dev

## Cloudflare Pages デプロイ

| 項目 | 値 |
|------|-----|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variables | `MICROCMS_SERVICE_DOMAIN`, `MICROCMS_API_KEY`, `PUBLIC_SITE_URL` |

Cloudflare Pages の環境変数 `PUBLIC_SITE_URL` に `https://suiren-notes.pages.dev` を設定してください（未設定でもこの URL が既定値として使われます）。

**GitHub Pages は使用しません。** 本番デプロイは Cloudflare Pages の Git 連携のみです。リポジトリで GitHub Pages を有効にすると、不要な `pages-build-deployment` チェックが失敗するため、有効にしないでください。

## SEO 対応

- ページごとの title / meta description
- OGP / Twitter Card
- canonical URL
- JSON-LD（記事ページ: BlogPosting）
- パンくずリスト
- 関連記事
- sitemap 自動生成
- robots.txt
- RSS フィード
- Google Analytics（Consent Mode + Cookie 同意バナー）

## 旧 URL からの移行

- `/article/index.html?id=xxxxx` → ビルド時に id→slug マップを生成し、クライアント側で `/articles/[slug]/` へリダイレクト
- `/articles/*.html` → `public/_redirects` で `/blog/` へ 301 リダイレクト（Cloudflare Pages）

## 開発メモ

- 既存の `css/style.css` は `public/css/style.css` に配置
- 旧静的ファイル（ルートの `index.html` 等）は参照用に残していますが、Astro ビルド後は `dist/` が本番出力です
