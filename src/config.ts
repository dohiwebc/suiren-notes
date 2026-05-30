/** 本番サイトURL（Cloudflare Pages） */
export const DEFAULT_SITE_URL = "https://suiren-notes.pages.dev";

/** サイト共通設定 */
export const SITE_CONFIG = {
  name: "Suiren Notes",
  author: "翠憐 / 08nsuiren",
  handle: "@08nsuiren",
  gaId: "G-7KJFFELQMB",
  ogImage: "/assets/images/suirennotes-OGP.png",
  favicon: "/favicon-32x32.png",
} as const;

export const BLOG_CATEGORIES = [
  "すべて",
  "N高",
  "スクーリング",
  "日常",
  "制作",
  "進路",
  "考えごと",
] as const;

export function getSiteUrl(): string {
  return (import.meta.env.PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
