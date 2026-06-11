import { getPostSlug } from "./utils";

export interface MicroCMSImage {
  url: string;
  width?: number;
  height?: number;
}

export interface MicroCMSListResponse<T> {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
}

export interface BlogPost {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  revisedAt?: string;
  title: string;
  /** microCMS に slug フィールド（テキスト）を追加してください */
  slug?: string;
  description?: string;
  body?: string;
  eyecatch?: MicroCMSImage | null;
  eyepatch?: MicroCMSImage | null;
  category?: string | string[];
  isPickup?: boolean;
}

export interface Profile {
  name?: string;
  catchcopy?: string;
  profileImage?: MicroCMSImage | null;
  bio?: string;
  school?: string;
  location?: string;
  message?: string;
  currentActivities?: string;
  whyNHigh?: string;
  mediaDifference?: string;
  tiktokUrl?: string;
  noteUrl?: string;
  amebaUrl?: string;
  githubUrl?: string;
}

export interface SiteSettings {
  siteTitle?: string;
  heroTitle?: string;
  heroText?: string;
  mainVisual?: MicroCMSImage | null;
  buttonText?: string;
  buttonUrl?: string;
  subButtonText?: string;
  subButtonUrl?: string;
  worksEnabled?: boolean;
  worksComingSoonTitle?: string;
  worksComingSoonText?: string;
  worksLead?: string;
  showWorksCategories?: boolean;
  worksPriceDisclaimer?: string;
  "2zDtf9ParC"?: string;
}

export interface Work {
  id: string;
  title: string;
  description?: string;
  thumbnail?: MicroCMSImage | null;
  url?: string;
  category?: string | string[];
  tech?: string[];
  projectType?: string | string[];
  priceAmount?: string;
  priceTax?: string;
  priceIsEstimate?: boolean;
  priceIncludes?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  publishedAt?: string;
  createdAt?: string;
}

const ENDPOINTS = {
  BLOG: "blog",
  PROFILE: "profile",
  WORKS: "works",
  SITE_SETTINGS: "site-settings",
} as const;

const FALLBACK_SITE_SETTINGS: SiteSettings = {
  siteTitle: "Suiren Notes",
  heroTitle: "TikTokでは話しきれないことを、ゆっくり書く場所。",
  heroText:
    "N高のこと、スクーリングのこと、日常、進路、Web制作。自分のペースで記録していく個人ログです。",
  mainVisual: null,
  buttonText: "最新記事を読む",
  buttonUrl: "/blog/",
  subButtonText: "自己紹介を見る",
  subButtonUrl: "/about/",
  worksEnabled: false,
  worksComingSoonTitle: "Coming Soon",
  worksComingSoonText:
    "制作実績ページは現在準備中です。公開できる作品から少しずつ掲載していきます。",
  worksLead:
    "Web制作の記録。ヒアリングから公開まで一貫して担当したものを掲載しています。",
  showWorksCategories: false,
  worksPriceDisclaimer:
    "掲載の参考制作費は目安です。内容・納期により変動します。",
};

export const FALLBACK_PROFILE: Profile = {
  name: "翠憐 / 08nsuiren",
  catchcopy: "TikTokでは話しきれないことを、ゆっくり書く場所。",
  profileImage: null,
  bio: "<p>N高生。TikTokでN高や日常について発信しながら、Web制作を勉強中。</p>",
  school: "N高等学校 ネットコース",
  location: "中四国",
  message:
    "<p>このサイトでは、動画では話しきれなかったことを、自分のペースで書いていきます。</p>",
  currentActivities:
    "<ul><li>N高等学校 ネットコースで学習</li><li>TikTokでN高や日常について発信</li><li>Web制作・ITを勉強中</li></ul>",
  whyNHigh:
    "<p>自分のペースで学べること、オンライン中心で通えること、発信や制作と両立しやすいことが決め手でした。</p>",
  mediaDifference:
    "<p><strong>TikTok</strong> … 短く、いまの気持ちに近い話。<br><strong>note</strong> … もう少し長く読める文章向け。<br><strong>Suiren Notes</strong> … 自分のペースで残す、ゆっくり書くログです。</p>",
  tiktokUrl: "",
  noteUrl: "",
  amebaUrl: "",
  githubUrl: "",
};

export const FALLBACK_BLOG_POSTS: BlogPost[] = [
  {
    id: "fallback-blog-1",
    title: "N高に入った理由",
    slug: "why-i-chose-n-high-school",
    description: "通信制高校を選ぶまでの経緯と、N高を選んだ理由をまとめました。",
    body: "<p>ここに記事本文が入ります。microCMS連携後はリッチエディタの内容が表示されます。</p>",
    eyecatch: null,
    category: "N高",
    isPickup: true,
    publishedAt: "2025-01-15T00:00:00.000Z",
  },
  {
    id: "fallback-blog-2",
    title: "通信制高校を選ぶ前に不安だったこと",
    slug: "online-highschool-daily-life",
    description: "入学前に感じていた不安と、実際に通ってみてどうだったか。",
    body: "<p>不安だった点や、入学後に変わったことについて書いていきます。</p>",
    eyecatch: null,
    category: "スクーリング",
    isPickup: true,
    publishedAt: "2025-02-01T00:00:00.000Z",
  },
  {
    id: "fallback-blog-3",
    title: "AIを使ってWeb制作している話",
    slug: "n-high-report",
    description: "勉強中のWeb制作でAIをどう活用しているか、現状のメモです。",
    body: "<p>HTML / CSS / JavaScript と AI ツールを組み合わせながら制作しています。</p>",
    eyecatch: null,
    category: "制作",
    isPickup: false,
    publishedAt: "2025-03-10T00:00:00.000Z",
  },
];

function getMicroCMSConfig(): { domain: string; apiKey: string } | null {
  const domain = import.meta.env.MICROCMS_SERVICE_DOMAIN;
  const apiKey = import.meta.env.MICROCMS_API_KEY;

  if (!domain || !apiKey || domain === "YOUR_SERVICE_DOMAIN" || apiKey === "your_api_key_here") {
    return null;
  }

  return { domain, apiKey };
}

function getBaseUrl(domain: string): string {
  return `https://${domain}.microcms.io/api/v1`;
}

async function fetchMicroCMS<T>(endpoint: string, queries = ""): Promise<T> {
  const config = getMicroCMSConfig();
  if (!config) {
    throw new Error("microCMS の設定が完了していません");
  }

  const queryPart = queries ? `?${queries}` : "";
  const url = `${getBaseUrl(config.domain)}/${endpoint}${queryPart}`;

  const response = await fetch(url, {
    headers: {
      "X-MICROCMS-API-KEY": config.apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`microCMS API エラー: ${response.status} (${endpoint})`);
  }

  return response.json() as Promise<T>;
}

async function fetchListPage<T>(
  endpoint: string,
  offset: number,
  limit: number,
  extraParams: Record<string, string> = {}
): Promise<MicroCMSListResponse<T>> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    orders: "-publishedAt",
    ...extraParams,
  });
  return fetchMicroCMS<MicroCMSListResponse<T>>(endpoint, params.toString());
}

async function fetchAllFromList<T>(
  endpoint: string,
  extraParams: Record<string, string> = {}
): Promise<T[]> {
  const limit = 100;
  let offset = 0;
  let totalCount = 0;
  const items: T[] = [];

  do {
    const data = await fetchListPage<T>(endpoint, offset, limit, extraParams);
    items.push(...(data.contents || []));
    totalCount = data.totalCount || items.length;
    offset += limit;
  } while (offset < totalCount);

  return items;
}

/** ブログ記事をすべて取得（ビルド時・メモリキャッシュ） */
let blogPostsCache: BlogPost[] | null = null;

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  if (blogPostsCache) return blogPostsCache;

  try {
    const posts = await fetchAllFromList<BlogPost>(ENDPOINTS.BLOG);
    blogPostsCache = posts.length > 0 ? posts : [...FALLBACK_BLOG_POSTS];
  } catch (err) {
    console.warn(
      "[Suiren Notes] microCMS から記事を取得できませんでした。フォールバックデータを使用します。",
      err
    );
    blogPostsCache = [...FALLBACK_BLOG_POSTS];
  }

  return blogPostsCache;
}

/** sitemap 用：キャッシュを使わず最新の記事一覧を取得 */
export async function fetchBlogPostsForSitemap(): Promise<BlogPost[]> {
  try {
    const posts = await fetchAllFromList<BlogPost>(ENDPOINTS.BLOG);
    return posts.length > 0 ? posts : [...FALLBACK_BLOG_POSTS];
  } catch (err) {
    console.warn(
      "[Suiren Notes] sitemap 用の記事取得に失敗しました。フォールバックデータを使用します。",
      err
    );
    return [...FALLBACK_BLOG_POSTS];
  }
}

/** slug から記事を取得 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getAllBlogPosts();
  return posts.find((post) => getPostSlug(post) === slug) ?? null;
}

/** id → slug のマップ（旧URLリダイレクト用） */
export async function getIdToSlugMap(): Promise<Record<string, string>> {
  const posts = await getAllBlogPosts();
  return Object.fromEntries(posts.map((post) => [post.id, getPostSlug(post)]));
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const data = await fetchMicroCMS<SiteSettings>(ENDPOINTS.SITE_SETTINGS);
    return { ...FALLBACK_SITE_SETTINGS, ...data };
  } catch {
    return { ...FALLBACK_SITE_SETTINGS };
  }
}

export async function getProfile(): Promise<Profile> {
  try {
    const data = await fetchMicroCMS<Profile>(ENDPOINTS.PROFILE);
    return { ...FALLBACK_PROFILE, ...data };
  } catch {
    return { ...FALLBACK_PROFILE };
  }
}

export async function getWorksList(): Promise<Work[]> {
  try {
    return await fetchAllFromList<Work>(ENDPOINTS.WORKS);
  } catch {
    return [];
  }
}

export function isWorksEnabled(settings: SiteSettings): boolean {
  return settings.worksEnabled === true;
}

export function filterPublishedWorks(works: Work[]): Work[] {
  return works.filter((work) => work.isPublished === true);
}

export function getWorksLead(settings: SiteSettings): string {
  const fromCms = settings.worksLead;
  if (fromCms == null || String(fromCms).trim() === "") return "";
  return String(fromCms).trim();
}

export function getWorksPriceDisclaimer(settings: SiteSettings): string {
  const fromCms = settings.worksPriceDisclaimer ?? settings["2zDtf9ParC"];
  if (fromCms == null || String(fromCms).trim() === "") {
    return String(FALLBACK_SITE_SETTINGS.worksPriceDisclaimer || "").trim();
  }
  return String(fromCms).trim();
}

export function getWorkCategories(work: Work): string[] {
  if (!work || work.category == null) return [];
  if (Array.isArray(work.category)) {
    return work.category.map((c) => String(c).trim()).filter(Boolean);
  }
  const single = String(work.category).trim();
  return single ? [single] : [];
}

export function getTikTokUrl(profile: Profile): string | null {
  const url = String(profile.tiktokUrl || "").trim();
  if (!url || !/^https?:\/\//i.test(url)) return null;
  return url;
}
