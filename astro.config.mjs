import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { loadEnv } from "vite";
import { fetchBlogPostsForSitemap } from "./src/lib/microcms.ts";
import { getPostSlug } from "./src/lib/utils.ts";

const env = loadEnv(process.env.MODE || "production", process.cwd(), "");
Object.assign(process.env, env);

const SITE_URL = (env.PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL || "https://08nsuiren.com").replace(
  /\/$/,
  ""
);
const posts = await fetchBlogPostsForSitemap();

export default defineConfig({
  site: SITE_URL,
  trailingSlash: "always",
  output: "static",
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/article/"),
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
        return item;
      },
    }),
  ],
});
