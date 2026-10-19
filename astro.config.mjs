import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { loadEnv } from "vite";
import {
  fetchBlogPostsForSitemap,
  getSiteSettings,
  isWorksEnabled,
} from "./src/lib/microcms.ts";
import { getPostSlug } from "./src/lib/utils.ts";

const env = loadEnv(process.env.MODE || "production", process.cwd(), "");
Object.assign(process.env, env);

const SITE_URL = (env.PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL || "https://08nsuiren.com").replace(
  /\/$/,
  ""
);
const posts = await fetchBlogPostsForSitemap();
const siteSettings = await getSiteSettings();
const worksEnabled = isWorksEnabled(siteSettings);

export default defineConfig({
  site: SITE_URL,
  trailingSlash: "always",
  output: "static",
  integrations: [
    sitemap({
      /**
       * 公開してクロールさせたいページのみ。
       * - /article/ … 旧URL案内（noindex）
       * - /works/ … 準備中（worksEnabled=false）のときは除外
       */
      filter: (page) => {
        if (page.includes("/article/")) return false;
        if (!worksEnabled && (page.endsWith("/works/") || page.includes("/works/"))) {
          return false;
        }
        return true;
      },
      serialize(item) {
        const post = posts.find((entry) => {
          const slug = getPostSlug(entry);
          return (
            item.url.includes(`/articles/${slug}/`) ||
            item.url.includes(`/articles/${encodeURIComponent(slug)}/`)
          );
        });
        if (post) {
          item.lastmod =
            post.updatedAt || post.revisedAt || post.publishedAt || post.createdAt || "";
          item.changefreq = "monthly";
          item.priority = 0.8;
        }
        if (item.url.includes("/n-high/")) {
          item.changefreq = "weekly";
          item.priority = 0.9;
        }
        return item;
      },
    }),
  ],
});
