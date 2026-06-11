/** 本番サイトURL */
export const DEFAULT_SITE_URL = "https://08nsuiren.com";

/** サイト共通設定 */
export const SITE_CONFIG = {
  name: "Suiren Notes",
  author: "翠憐 / 08nsuiren",
  handle: "@08nsuiren",
  gaId: "G-7KJFFELQMB",
  /** Google Search Console（HTMLタグ方式） */
  googleSiteVerification: "cGVfV9wGRvn2z2oZ0vf9CIdCbMrSqF88OppN0YUYw4I",
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

/** CSS/JS 更新時にインクリメント（キャッシュバスト） */
export const ASSET_VERSION =
  import.meta.env.PUBLIC_ASSET_VERSION || "20260605";

/** 静的アセット URL（?v= 付与） */
export function assetUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const separator = normalized.includes("?") ? "&" : "?";
  return `${normalized}${separator}v=${ASSET_VERSION}`;
}
