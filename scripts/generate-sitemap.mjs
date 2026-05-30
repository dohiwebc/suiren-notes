/**
 * sitemap.xml を生成します（デプロイ前に実行）
 * 使い方: node scripts/generate-sitemap.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const SITE_URL = "https://suiren08n.static.jp";
const SERVICE_DOMAIN = "suiren";
const API_KEY = "UChGfUBgseXegREAhQtCIw4h0EA5NOc2UtTm";

const STATIC_PAGES = [
  { loc: `${SITE_URL}/`, priority: "1.0" },
  { loc: `${SITE_URL}/about/`, priority: "0.8" },
  { loc: `${SITE_URL}/blog/`, priority: "0.9" },
  { loc: `${SITE_URL}/works/`, priority: "0.8" },
  { loc: `${SITE_URL}/privacy.html`, priority: "0.5" },
  { loc: `${SITE_URL}/links.html`, priority: "0.6" },
];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toUrlEntry(loc, lastmod, priority = "0.7") {
  const lastmodTag = lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : "";
  return `  <url>
    <loc>${escapeXml(loc)}</loc>${lastmodTag}
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function getArticleUrl(post) {
  return `${SITE_URL}/article/?id=${encodeURIComponent(post.id)}`;
}

async function fetchBlogPosts() {
  const url = `https://${SERVICE_DOMAIN}.microcms.io/api/v1/blog?limit=100&orders=-publishedAt`;
  const response = await fetch(url, {
    headers: { "X-MICROCMS-API-KEY": API_KEY },
  });

  if (!response.ok) {
    throw new Error(`blog API error: ${response.status}`);
  }

  const data = await response.json();
  return data.contents || [];
}

async function main() {
  const entries = STATIC_PAGES.map((page) => toUrlEntry(page.loc, null, page.priority));

  try {
    const posts = await fetchBlogPosts();
    posts.forEach((post) => {
      if (!post.id) return;
      const lastmod = (post.updatedAt || post.publishedAt || post.createdAt || "").slice(0, 10);
      entries.push(
        toUrlEntry(
          getArticleUrl(post),
          lastmod,
          "0.7"
        )
      );
    });
    console.log(`記事 ${posts.length} 件を sitemap に追加しました`);
  } catch (err) {
    console.warn("記事一覧の取得に失敗しました。固定ページのみ出力します。", err.message);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;

  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  writeFileSync(join(root, "sitemap.xml"), xml, "utf8");
  console.log("sitemap.xml を書き出しました");
}

main();
