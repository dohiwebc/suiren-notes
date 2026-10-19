import { absoluteUrl } from "../config";
import { sanitizeRichText } from "./sanitize";
import type { BlogPost } from "./microcms";

/** 日付フォーマット（YYYY.MM.DD） */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

export function getDisplayDate(item: { publishedAt?: string; createdAt?: string }): string {
  return formatDate(item.publishedAt || item.createdAt);
}

/** 並び替え用の公開日時（publishedAt 優先） */
export function getPostPublishedAtIso(item: {
  publishedAt?: string;
  createdAt?: string;
}): string {
  return item.publishedAt || item.createdAt || "";
}

export function sortBlogPostsByDate<T extends { publishedAt?: string; createdAt?: string }>(
  posts: T[],
  order: "newest" | "oldest" = "newest"
): T[] {
  const mult = order === "newest" ? -1 : 1;
  return [...posts].sort(
    (a, b) =>
      (new Date(getPostPublishedAtIso(a) || 0).getTime() -
        new Date(getPostPublishedAtIso(b) || 0).getTime()) *
      mult
  );
}

/**
 * ブログカテゴリ表示名の正規化
 * - 旧「Web制作」→「制作」
 * - 「考え事」→「考えごと」（表記ゆれを正規URLに統一）
 */
export function normalizeBlogCategory(category: string): string {
  const label = String(category).trim();
  if (label === "Web制作") return "制作";
  if (label === "考え事") return "考えごと";
  return label;
}

/** 記事が1件以上あるカテゴリのみ（空カテゴリページ生成を防ぐ） */
export function getCategoriesWithPosts(posts: BlogPost[]): string[] {
  const set = new Set<string>();
  for (const post of posts) {
    for (const cat of getBlogCategories(post)) {
      set.add(cat);
    }
  }
  return [...set];
}

/** ブログ記事のカテゴリ一覧 */
export function getBlogCategories(post: BlogPost): string[] {
  if (!post || post.category == null) return [];
  if (Array.isArray(post.category)) {
    return post.category.map((c) => normalizeBlogCategory(String(c))).filter(Boolean);
  }
  const single = normalizeBlogCategory(String(post.category));
  return single ? [single] : [];
}

export function getBlogPrimaryCategory(post: BlogPost): string {
  return getBlogCategories(post)[0] || "";
}

export function postMatchesBlogCategory(post: BlogPost, filterCategory: string): boolean {
  if (!filterCategory || filterCategory === "すべて") return true;
  return getBlogCategories(post).includes(filterCategory);
}

/** 記事のアイキャッチ（CMSで eyepatch と登録されている場合も吸収） */
export function getBlogEyecatch(post: BlogPost): MicroCMSImage | string | null {
  return post.eyecatch || post.eyepatch || null;
}

export {
  buildMicroCMSSrcSet,
  getImageUrl,
  getOptimizedImageUrl,
  optimizeMicroCMSImageUrl,
} from "./image";
export type { MicroCMSImageOptions } from "./image";

/**
 * 記事の slug を取得。
 * microCMS に slug フィールド（テキスト）を追加してください。
 * 未設定の場合は id を代替として使用し、警告を出します。
 */
export function getPostSlug(post: BlogPost): string {
  const slug = String(post.slug ?? "").trim();
  if (slug) return slug;

  console.warn(
    `[Suiren Notes] 記事 "${post.title}" (id: ${post.id}) に slug がありません。id を代替として使用します。microCMS に slug フィールドを追加してください。`
  );
  return post.id;
}

/** 記事詳細ページのパス（末尾スラッシュ付き） */
export function getArticlePath(post: BlogPost): string {
  return `/articles/${encodeURIComponent(getPostSlug(post))}/`;
}

export function getArticleUrl(post: BlogPost): string {
  return absoluteUrl(getArticlePath(post));
}

export function stripHtmlToText(html: string | null | undefined): string {
  const sanitized = sanitizeRichText(html || "");
  return sanitized
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getArticleDescription(post: BlogPost): string {
  const description = String(post.description || "").trim();
  if (description) return description;
  const bodyText = stripHtmlToText(post.body).slice(0, 120);
  return bodyText || "Suiren Notes のブログ記事。";
}

export function getCategoryPath(category: string): string {
  const normalized = normalizeBlogCategory(category);
  return `/blog/category/${encodeURIComponent(normalized)}/`;
}

export function getRelatedPosts(
  currentPost: BlogPost,
  allPosts: BlogPost[],
  limit = 3
): BlogPost[] {
  const categories = getBlogCategories(currentPost);
  if (categories.length === 0) return [];

  const categorySet = new Set(categories);
  const excludedIds = new Set([currentPost.id].filter(Boolean).map(String));

  return allPosts
    .filter((post) => post && !excludedIds.has(String(post.id)))
    .filter((post) => getBlogCategories(post).some((c) => categorySet.has(c)))
    .sort(
      (a, b) =>
        new Date(b.publishedAt || b.createdAt || 0).getTime() -
        new Date(a.publishedAt || a.createdAt || 0).getTime()
    )
    .slice(0, limit);
}
