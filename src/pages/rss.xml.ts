import rss from "@astrojs/rss";
import { SITE_CONFIG, getSiteUrl } from "../config";
import { getAllBlogPosts } from "../lib/microcms";
import { getArticleDescription, getArticleUrl, getPostSlug } from "../lib/utils";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const posts = await getAllBlogPosts();
  const site = getSiteUrl();

  return rss({
    title: SITE_CONFIG.name,
    description: "Suiren Notes — TikTokでは話しきれないことを、ゆっくり書く場所。",
    site,
    items: posts.map((post) => ({
      title: post.title,
      pubDate: new Date(post.publishedAt || post.createdAt || Date.now()),
      description: getArticleDescription(post),
      link: getArticleUrl(post),
      guid: `${site}/articles/${getPostSlug(post)}/`,
    })),
    customData: `<language>ja</language>`,
  });
};
