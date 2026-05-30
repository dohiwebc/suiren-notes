import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Cloudflare Pages: npm run build → dist
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || "https://suiren08n.static.jp",
  trailingSlash: "always",
  output: "static",
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/article/"),
    }),
  ],
});
