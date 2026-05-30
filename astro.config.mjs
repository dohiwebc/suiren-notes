import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

// Cloudflare Pages: npm run build → dist
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || "https://suiren-notes.pages.dev",
  trailingSlash: "always",
  output: "static",

  integrations: [
    sitemap({
      filter: (page) => !page.includes("/article/"),
    }),
  ],

  adapter: cloudflare()
});