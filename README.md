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
| `/n-high/` | N高・通信制高校の総合案内 |
| `/blog/` | 記事一覧 |
| `/blog/category/[category]/` | カテゴリ別一覧（記事があるカテゴリのみ生成） |
| `/articles/[slug]/` | 記事詳細（静的生成） |
| `/article/?id=xxx` | 旧 URL（新 URL へリダイレクト） |
| `/about/` | プロフィール |
| `/works/` | 制作実績（準備中は noindex・sitemap 除外） |
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

本番ドメイン想定: `https://08nsuiren.com`（`PUBLIC_SITE_URL` に設定）

**GitHub Pages は使用しません。** 本番デプロイは Cloudflare Pages の Git 連携のみです。リポジトリで GitHub Pages を有効にすると、不要な `pages-build-deployment` チェックが失敗するため、有効にしないでください。

### microCMS 更新後の本番反映（重要）

このサイトは **ビルド時に microCMS から記事を取得して静的 HTML / sitemap を生成**します。  
管理画面で記事を更新しただけでは本番は変わりません。**再ビルドが必要**です。

推奨フロー（どちらか）:

1. **Git プッシュで Cloudflare Pages が自動ビルド**（通常の運用）
2. **microCMS の Webhook → Cloudflare Pages Deploy Hook**  
   - Cloudflare Pages → Settings → Deploy hooks で URL を発行  
   - microCMS → API 設定 → Webhook で「公開・更新時」にその URL を POST  
   - これで記事更新のたびに静的 HTML と `sitemap-index.xml` が再生成されます

未設定の場合は、記事更新後に手動で Cloudflare Pages の「Retry deployment」を実行してください。

## SEO 対応

- ページごとの title / meta description
- OGP / Twitter Card
- canonical URL
- JSON-LD（記事: BlogPosting / トップ: WebSite / `/n-high/`: CollectionPage）
- `/n-high/` 総合案内とサイト内導線
- 空カテゴリページは生成しない（「考え事」→「考えごと」に正規化）
- 準備中の `/works/` は noindex かつ sitemap 除外
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
