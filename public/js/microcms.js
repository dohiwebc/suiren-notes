/**
 * microCMS 共通処理・フォールバックデータ
 */

/** 設定が未入力かどうか */
function isMicroCMSConfigured() {
  const { SERVICE_DOMAIN, API_KEY } = MICROCMS_CONFIG;
  return (
    SERVICE_DOMAIN &&
    API_KEY &&
    SERVICE_DOMAIN !== "YOUR_SERVICE_DOMAIN" &&
    API_KEY !== "YOUR_API_KEY"
  );
}

/** microCMS API のベースURL */
function getMicroCMSBaseUrl() {
  return `https://${MICROCMS_CONFIG.SERVICE_DOMAIN}.microcms.io/api/v1`;
}

/**
 * microCMS からデータを取得する共通関数
 * @param {string} endpoint - エンドポイント名
 * @param {string} queries - クエリ文字列（先頭の ? は不要）
 */
async function fetchMicroCMS(endpoint, queries = "") {
  if (!isMicroCMSConfigured()) {
    throw new Error("microCMS の設定が完了していません");
  }

  const queryPart = queries ? `?${queries}` : "";
  const url = `${getMicroCMSBaseUrl()}/${endpoint}${queryPart}`;

  const response = await fetch(url, {
    headers: {
      "X-MICROCMS-API-KEY": MICROCMS_CONFIG.API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`APIエラー: ${response.status}`);
  }

  return response.json();
}

/**
 * リスト形式 API 取得
 * @param {string} endpoint
 * @param {Object} queryParams - { limit: 10, filters: '...', orders: '-publishedAt' } など
 */
async function fetchList(endpoint, queryParams = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  const queries = searchParams.toString();
  return fetchMicroCMS(endpoint, queries);
}

/** オブジェクト形式 API 取得 */
async function fetchObject(endpoint) {
  return fetchMicroCMS(endpoint);
}

/** 詳細取得（リスト形式エンドポイントの1件） */
async function fetchDetail(endpoint, contentId) {
  if (!isMicroCMSConfigured()) {
    throw new Error("microCMS の設定が完了していません");
  }

  const url = `${getMicroCMSBaseUrl()}/${endpoint}/${contentId}`;

  const response = await fetch(url, {
    headers: {
      "X-MICROCMS-API-KEY": MICROCMS_CONFIG.API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`APIエラー: ${response.status}`);
  }

  return response.json();
}

/** 日付フォーマット（YYYY.MM.DD） */
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

/** 表示用日付（publishedAt 優先） */
function getDisplayDate(item) {
  return formatDate(item.publishedAt || item.createdAt);
}

/** HTMLエスケープ（テキスト用） */
function escapeHtml(text) {
  if (text == null) return "";
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}

/** ローカル開発中かどうか（開発中だけフォールバックデータを使う） */
function isDevelopmentSite() {
  const { hostname, protocol } = window.location;
  return (
    protocol === "file:" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === ""
  );
}

/** 明示的なURLスキームを持つか */
function hasExplicitUrlScheme(url) {
  return /^[a-z][a-z0-9+.-]*:/i.test(String(url).trim());
}

/** 旧 *.html リンクをディレクトリ URL に寄せる（CMSの過去値用） */
function normalizeLegacyInternalUrl(url) {
  const raw = String(url ?? "").trim();
  if (!raw || hasExplicitUrlScheme(raw) || raw.startsWith("//")) return raw;

  const map = {
    "blog.html": "/blog/",
    "about.html": "/about/",
    "works.html": "/works/",
    "privacy.html": "/privacy.html",
    "links.html": "/links.html",
    "index.html": "/",
  };
  if (map[raw]) return map[raw];

  const articleDirMatch = /^article\/(\?.*)?$/i.exec(raw);
  if (articleDirMatch) {
    const qs = articleDirMatch[1] || "";
    return `/article/index.html${qs}`;
  }

  const articleMatch = /^article\.html(\?.*)?$/i.exec(raw);
  if (articleMatch) {
    const qs = articleMatch[1] || "";
    return `/article/index.html${qs}`;
  }

  return raw;
}

/** CMS由来URLを許可スキームだけに絞る */
function getSafeUrl(
  url,
  fallback = "#",
  {
    allowRelative = true,
    allowedProtocols = ["http:", "https:", "mailto:", "tel:"],
  } = {}
) {
  if (url == null) return fallback;

  const rawUrl = normalizeLegacyInternalUrl(String(url).trim());
  if (!rawUrl) return fallback;

  try {
    const parsed = new URL(rawUrl, window.location.origin);
    if (!allowedProtocols.includes(parsed.protocol)) return fallback;

    const isProtocolRelative = rawUrl.startsWith("//");
    const isRelative = !hasExplicitUrlScheme(rawUrl) && !isProtocolRelative;
    if (isRelative) return allowRelative ? rawUrl : fallback;

    return parsed.href;
  } catch {
    return fallback;
  }
}

/** 空や危険なURLは null にする */
function getSafeOptionalUrl(url, options) {
  const safeUrl = getSafeUrl(url, "", options);
  return safeUrl || null;
}

/** CMSのリッチテキストを安全なHTMLだけに絞る */
function sanitizeRichText(html) {
  if (html == null) return "";

  const template = document.createElement("template");
  template.innerHTML = String(html);

  const allowedTags = new Set([
    "a",
    "b",
    "blockquote",
    "br",
    "code",
    "em",
    "figcaption",
    "figure",
    "h2",
    "h3",
    "h4",
    "hr",
    "i",
    "img",
    "li",
    "ol",
    "p",
    "pre",
    "s",
    "span",
    "strong",
    "table",
    "tbody",
    "td",
    "th",
    "thead",
    "tr",
    "u",
    "ul",
  ]);
  const blockedTags = new Set([
    "base",
    "button",
    "embed",
    "form",
    "iframe",
    "input",
    "link",
    "meta",
    "object",
    "script",
    "select",
    "style",
    "svg",
    "textarea",
  ]);

  function isSafeRichTextUrl(value) {
    return Boolean(getSafeOptionalUrl(value));
  }

  function sanitizeAttributes(el, tagName) {
    [...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value;

      if (name.startsWith("on") || name === "style") {
        el.removeAttribute(attr.name);
        return;
      }

      if (tagName === "a") {
        if (name === "href") {
          if (!isSafeRichTextUrl(value)) el.removeAttribute(attr.name);
          return;
        }
        if (name === "target") {
          if (value !== "_blank") el.removeAttribute(attr.name);
          return;
        }
        if (name === "rel" || name === "title") return;
      }

      if (tagName === "img") {
        if (name === "src") {
          const safeSrc = getSafeOptionalUrl(value, {
            allowedProtocols: ["http:", "https:"],
          });
          if (!safeSrc) el.removeAttribute(attr.name);
          return;
        }
        if (["alt", "height", "loading", "width"].includes(name)) return;
      }

      if ((tagName === "td" || tagName === "th") && ["colspan", "rowspan"].includes(name)) {
        return;
      }

      el.removeAttribute(attr.name);
    });

    if (tagName === "a" && el.getAttribute("target") === "_blank") {
      el.setAttribute("rel", "noopener noreferrer");
    }

    if (tagName === "img" && !el.getAttribute("loading")) {
      el.setAttribute("loading", "lazy");
    }
  }

  function sanitizeNode(node) {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.remove();
        return;
      }

      if (child.nodeType !== Node.ELEMENT_NODE) return;

      const tagName = child.tagName.toLowerCase();
      if (blockedTags.has(tagName)) {
        child.remove();
        return;
      }

      sanitizeNode(child);

      if (!allowedTags.has(tagName)) {
        child.replaceWith(...child.childNodes);
        return;
      }

      sanitizeAttributes(child, tagName);
    });
  }

  sanitizeNode(template.content);
  return template.innerHTML;
}

/** フォールバック用のプレースホルダー画像URL（グラデーションSVG） */
function getPlaceholderImage(label = "Suiren Notes") {
  const safeLabel = String(label)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <rect width="800" height="450" fill="#f0ebe3"/>
      <rect x="40" y="40" width="720" height="370" fill="none" stroke="#8ab6d6" stroke-width="1" opacity="0.5"/>
      <text x="400" y="240" text-anchor="middle" fill="#243b53" font-family="Georgia, serif" font-size="18" letter-spacing="4">${safeLabel}</text>
    </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** 画像URL取得（なければプレースホルダー） */
function getImageUrl(imageField, fallbackLabel) {
  const placeholder = getPlaceholderImage(fallbackLabel);
  if (typeof imageField === "string" && imageField.trim()) {
    return getSafeUrl(imageField, placeholder, {
      allowedProtocols: ["http:", "https:"],
    });
  }
  if (imageField && imageField.url) {
    return getSafeUrl(imageField.url, placeholder, {
      allowedProtocols: ["http:", "https:"],
    });
  }
  return placeholder;
}

/** 記事のアイキャッチ（CMSで eyepatch と登録されている場合も吸収） */
function getBlogEyecatch(post) {
  if (!post) return null;
  return post.eyecatch || post.eyepatch || null;
}

// --- フォールバックデータ ---

const FALLBACK_SITE_SETTINGS = {
  siteTitle: "Suiren Notes",
  heroTitle: "TikTokでは話しきれないことを、ゆっくり書く場所。",
  heroText:
    "N高のこと、スクーリングのこと、日常、進路、Web制作。自分のペースで記録していく個人ログです。",
  mainVisual: null,
  buttonText: "最新記事を読む",
  buttonUrl: "/blog/",
  subButtonText: "自己紹介を見る",
  subButtonUrl: "/about/",
  // Worksページの公開設定（デフォルトは非公開）
  worksEnabled: false,
  worksComingSoonTitle: "Coming Soon",
  worksComingSoonText:
    "制作実績ページは現在準備中です。公開できる作品から少しずつ掲載していきます。",
  worksLead:
    "Web制作の記録。ヒアリングから公開まで一貫して担当したものを掲載しています。",
  showWorksCategories: false,
  // site-settings: フィールドID 2zDtf9ParC（参考制作費の注釈・空欄で非表示）
  worksPriceDisclaimer:
    "掲載の参考制作費は目安です。内容・納期により変動します。",
};

/** site-settings: Works ヒーローリード（フィールドID: worksLead） */
const SITE_SETTINGS_WORKS_LEAD_FIELD = "worksLead";

/** site-settings: 参考制作費注釈（worksPriceDisclaimer / 旧 2zDtf9ParC） */
const SITE_SETTINGS_PRICE_DISCLAIMER_FIELD = "2zDtf9ParC";

const FALLBACK_PROFILE = {
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

const FALLBACK_BLOG_POSTS = [
  {
    id: "fallback-blog-1",
    title: "N高に入った理由",
    slug: "why-n-high-school",
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
    slug: "anxiety-before-n-high",
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
    slug: "ai-web-development",
    description: "勉強中のWeb制作でAIをどう活用しているか、現状のメモです。",
    body: "<p>HTML / CSS / JavaScript と AI ツールを組み合わせながら制作しています。</p>",
    eyecatch: null,
    category: "制作",
    isPickup: false,
    publishedAt: "2025-03-10T00:00:00.000Z",
  },
];

const FALLBACK_WORKS = [
  {
    id: "fallback-work-1",
    title: "FreelaBoard",
    description: "フリーランス向けのタスク・案件管理Webアプリ。",
    thumbnail: null,
    url: "",
    category: "WebApp",
    tech: ["HTML", "CSS", "JavaScript", "Firebase"],
    projectType: ["自主制作"],
    priceAmount: "要相談",
    priceTax: "税込",
    priceIsEstimate: true,
    isFeatured: true,
    isPublished: false,
  },
  {
    id: "fallback-work-2",
    title: "SAKURA GROUP MATCH LOG",
    description: "グループマッチの記録・振り返り用サイト。",
    thumbnail: null,
    url: "",
    category: "Portfolio",
    tech: ["HTML", "CSS", "JavaScript", "GitHub Pages"],
    projectType: ["架空案件"],
    priceAmount: "5万円〜",
    priceTax: "税込",
    priceIsEstimate: true,
    priceIncludes: "構成・デザイン・コーディング",
    isFeatured: true,
    isPublished: false,
  },
  {
    id: "fallback-work-3",
    title: "ABYSS",
    description: "ブランドコンセプトを表現したLP制作。",
    thumbnail: null,
    url: "",
    category: "LP",
    tech: ["HTML", "CSS", "JavaScript", "AI"],
    projectType: ["架空案件"],
    priceAmount: "3万円〜",
    priceTax: "税込",
    priceIsEstimate: true,
    isFeatured: true,
    isPublished: false,
  },
];

/** Worksページを公開するか（site-settings の worksEnabled） */
function isWorksEnabled(settings) {
  return settings && settings.worksEnabled === true;
}

/** Worksのカテゴリフィルターを表示するか */
function isWorksCategoriesVisible(settings) {
  return settings && settings.showWorksCategories === true;
}

/** Worksページのヒーローリード文（未入力・空白のみなら非表示） */
function getWorksLead(settings) {
  if (!settings) {
    return String(FALLBACK_SITE_SETTINGS.worksLead || "").trim();
  }

  const fromCms = settings[SITE_SETTINGS_WORKS_LEAD_FIELD];
  if (fromCms == null || String(fromCms).trim() === "") {
    return "";
  }

  return String(fromCms).trim();
}

/** Worksページの参考制作費に関する注釈（未入力・空白のみなら非表示） */
function getWorksPriceDisclaimer(settings) {
  if (!settings) {
    return String(FALLBACK_SITE_SETTINGS.worksPriceDisclaimer || "").trim();
  }

  const fromCms =
    settings.worksPriceDisclaimer ??
    settings[SITE_SETTINGS_PRICE_DISCLAIMER_FIELD];

  if (fromCms == null || String(fromCms).trim() === "") {
    return "";
  }

  return String(fromCms).trim();
}

/** サイト上に公開する制作実績だけに絞る（isPublished が true のもの） */
function filterPublishedWorks(works) {
  if (!Array.isArray(works)) return [];
  return works.filter((work) => work.isPublished === true);
}

/** Works準備中カードのHTML */
function renderWorksComingSoon(settings) {
  const title =
    (settings && settings.worksComingSoonTitle) ||
    FALLBACK_SITE_SETTINGS.worksComingSoonTitle;
  const text =
    (settings && settings.worksComingSoonText) ||
    FALLBACK_SITE_SETTINGS.worksComingSoonText;

  return `
    <div class="works-coming-soon" role="status">
      <p class="works-coming-soon__label">Works</p>
      <h2 class="works-coming-soon__title">${escapeHtml(title)}</h2>
      <p class="works-coming-soon__text">${escapeHtml(text)}</p>
    </div>
  `;
}

/** サイト設定取得（失敗時フォールバック） */
async function getSiteSettings() {
  try {
    const data = await fetchObject(MICROCMS_CONFIG.ENDPOINTS.SITE_SETTINGS);
    return { ...FALLBACK_SITE_SETTINGS, ...data };
  } catch {
    return { ...FALLBACK_SITE_SETTINGS };
  }
}

/** プロフィール取得（失敗時フォールバック） */
async function getProfile() {
  try {
    const data = await fetchObject(MICROCMS_CONFIG.ENDPOINTS.PROFILE);
    return { ...FALLBACK_PROFILE, ...data };
  } catch {
    if (!isDevelopmentSite()) {
      throw new Error("プロフィールの取得に失敗しました");
    }
    return { ...FALLBACK_PROFILE };
  }
}

/** ブログ一覧取得（失敗時フォールバック） */
async function getBlogList(queryParams = {}) {
  try {
    const data = await fetchList(MICROCMS_CONFIG.ENDPOINTS.BLOG, {
      orders: "-publishedAt",
      limit: 100,
      ...queryParams,
    });
    return data.contents || [];
  } catch {
    if (!isDevelopmentSite()) {
      throw new Error("記事一覧の取得に失敗しました");
    }
    return [...FALLBACK_BLOG_POSTS];
  }
}

/** ブログ1件取得 */
async function getBlogPost(contentId) {
  try {
    return await fetchDetail(MICROCMS_CONFIG.ENDPOINTS.BLOG, contentId);
  } catch {
    if (isDevelopmentSite()) {
      const found = FALLBACK_BLOG_POSTS.find((p) => p.id === contentId);
      if (found) return found;
    }
    throw new Error("記事が見つかりません");
  }
}

/** 制作実績一覧取得 */
async function getWorksList(queryParams = {}) {
  try {
    const data = await fetchList(MICROCMS_CONFIG.ENDPOINTS.WORKS, {
      orders: "-publishedAt",
      limit: 100,
      ...queryParams,
    });
    return data.contents || [];
  } catch {
    if (!isDevelopmentSite()) {
      throw new Error("制作実績一覧の取得に失敗しました");
    }
    return [...FALLBACK_WORKS];
  }
}

/** エラーメッセージ表示用HTML */
function renderErrorMessage(message) {
  return `<p class="message message--error" role="alert">${escapeHtml(message)}</p>`;
}

/** ローディング表示 */
function renderLoading() {
  return '<p class="message message--loading">読み込み中...</p>';
}

/** SNSリンク配列を生成 */
function getSnsLinks(profile) {
  const links = [];
  const tiktokUrl = getSafeOptionalUrl(profile.tiktokUrl, {
    allowRelative: false,
    allowedProtocols: ["http:", "https:"],
  });
  const noteUrl = getSafeOptionalUrl(profile.noteUrl, {
    allowRelative: false,
    allowedProtocols: ["http:", "https:"],
  });
  const amebaUrl = getSafeOptionalUrl(profile.amebaUrl, {
    allowRelative: false,
    allowedProtocols: ["http:", "https:"],
  });
  const githubUrl = getSafeOptionalUrl(profile.githubUrl, {
    allowRelative: false,
    allowedProtocols: ["http:", "https:"],
  });

  if (tiktokUrl) {
    links.push({ label: "TikTok", url: tiktokUrl, icon: "tiktok" });
  }
  if (noteUrl) {
    links.push({ label: "note", url: noteUrl, icon: "note" });
  }
  if (amebaUrl) {
    links.push({ label: "Ameba", url: amebaUrl, icon: "ameba" });
  }
  if (githubUrl) {
    links.push({ label: "GitHub", url: githubUrl, icon: "github" });
  }
  return links;
}

/** TikTok URL（未設定なら null） */
function getTikTokUrl(profile) {
  if (!profile || !profile.tiktokUrl) return null;
  return getSafeOptionalUrl(profile.tiktokUrl, {
    allowRelative: false,
    allowedProtocols: ["http:", "https:"],
  });
}

/** TikTokアイコンSVG */
function renderTikTokIconSvg(size = 32) {
  return `<svg class="tiktok-link__icon" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false">
    <path fill="currentColor" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>`;
}

/** TikTokリンク（アイコンのみ） */
function renderTikTokIconLink(profile, className = "tiktok-link tiktok-link--icon-only") {
  const url = getTikTokUrl(profile);
  if (!url) return "";

  return `<a href="${escapeHtml(url)}" class="${escapeHtml(className)}" target="_blank" rel="noopener noreferrer" aria-label="TikTokで見る（新しいタブで開きます）">
    ${renderTikTokIconSvg(28)}
  </a>`;
}

/** TikTokリンク（アイコン＋ラベル） */
function renderTikTokLink(profile, className = "tiktok-link") {
  const url = getTikTokUrl(profile);
  if (!url) return "";

  return `<a href="${escapeHtml(url)}" class="${escapeHtml(className)}" target="_blank" rel="noopener noreferrer" aria-label="TikTokで見る（新しいタブで開きます）">
    ${renderTikTokIconSvg()}
    <span class="tiktok-link__label">TikTok</span>
  </a>`;
}

/** SNSリンクHTML（ヘッダー・フッター用コンパクト） */
function renderSnsLinks(profile, className = "sns-links") {
  const links = getSnsLinks(profile);
  if (links.length === 0) return "";

  const items = links
    .map((link) => {
      const safeUrl = getSafeOptionalUrl(link.url, {
        allowRelative: false,
        allowedProtocols: ["http:", "https:"],
      });
      if (!safeUrl) return "";
      return `<a href="${escapeHtml(safeUrl)}" class="${className}__item" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a>`;
    })
    .join("");

  return `<nav class="${className}" aria-label="SNSリンク">${items}</nav>`;
}

/** 制作実績のカテゴリ一覧（CMSで複数選択の配列にも対応） */
function getWorkCategories(work) {
  if (!work || work.category == null) return [];
  if (Array.isArray(work.category)) {
    return work.category.map((c) => String(c).trim()).filter(Boolean);
  }
  const single = String(work.category).trim();
  return single ? [single] : [];
}

/** 代表カテゴリ（先頭1つ・互換用） */
function getWorkCategory(work) {
  const cats = getWorkCategories(work);
  return cats[0] || "";
}

/** Worksのカテゴリフィルター一致判定 */
function workMatchesCategory(work, filterCategory) {
  if (!filterCategory || filterCategory === "すべて") return true;
  return getWorkCategories(work).includes(filterCategory);
}

/** ブログカテゴリ表示名（旧「Web制作」→「制作」） */
function normalizeBlogCategory(category) {
  const label = String(category).trim();
  if (label === "Web制作") return "制作";
  return label;
}

/** ブログ記事のカテゴリ一覧（CMSで複数選択の配列にも対応） */
function getBlogCategories(post) {
  if (!post || post.category == null) return [];
  if (Array.isArray(post.category)) {
    return post.category.map((c) => normalizeBlogCategory(c)).filter(Boolean);
  }
  const single = normalizeBlogCategory(post.category);
  return single ? [single] : [];
}

/** バッジ表示用の代表カテゴリ（先頭1つ） */
function getBlogPrimaryCategory(post) {
  const cats = getBlogCategories(post);
  return cats[0] || "";
}

/** ブログのカテゴリフィルター一致判定 */
function postMatchesBlogCategory(post, filterCategory) {
  if (!filterCategory || filterCategory === "すべて") return true;
  return getBlogCategories(post).includes(filterCategory);
}

/** 記事ページURL（/article/index.html?id=… ・関連カードは同一ページ内 ?id= のみ） */
function getArticleUrl(post) {
  const fromRoot =
    typeof window !== "undefined" && window.SUIREN_FROM_ROOT != null
      ? String(window.SUIREN_FROM_ROOT || "/")
      : "/";

  if (!post || !post.id) {
    return `${fromRoot}blog/`;
  }

  const articleId = encodeURIComponent(post.id);
  if (
    typeof window !== "undefined" &&
    window.SUIREN_ARTICLE_LINK_MODE === "query"
  ) {
    return `?id=${articleId}`;
  }

  return `${fromRoot}article/index.html?id=${articleId}`;
}

/** microCMS セレクト（単一・複数どちらでも先頭を取得） */
function normalizeCmsSelectValue(value) {
  if (value == null) return "";
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)[0] || "";
  }
  return String(value).trim();
}

/** microCMS セレクト複数値を配列で取得 */
function normalizeCmsSelectValues(value) {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  const single = String(value).trim();
  return single ? [single] : [];
}

/** 案件区分（自主制作 / 架空案件 / 実案件 など） */
function getWorkProjectTypes(work) {
  return normalizeCmsSelectValues(work && work.projectType);
}

/** 制作期間 */
function getWorkPeriod(work) {
  if (!work) return "";
  return String(work.period || "").trim();
}

/** 工夫した点 */
function getWorkHighlights(work) {
  if (!work) return "";
  return String(work.highlights || "").trim();
}

/** 学んだこと */
function getWorkLearnings(work) {
  if (!work) return "";
  return String(work.learnings || "").trim();
}

/** 参考制作費の金額（priceAmount 優先、旧フィールドは互換） */
function getWorkPriceAmount(work) {
  if (!work) return "";
  return String(
    work.priceAmount || work.priceRange || work.proceRange || "",
  ).trim();
}

/** 税込 / 税抜 */
function getWorkPriceTax(work) {
  return normalizeCmsSelectValue(work && work.priceTax);
}

/** 参考制作費が目安か */
function isWorkPriceEstimate(work) {
  if (!work || work.priceIsEstimate == null) return false;
  return work.priceIsEstimate === true;
}

/** 参考制作費に含む内容 */
function getWorkPriceIncludes(work) {
  if (!work) return "";
  const raw = String(work.priceIncludes || "").trim();
  if (!raw) return "";
  return raw.replace(/^含む内容\s*[：:;；]\s*/u, "");
}

/** 参考制作費ブロックを表示するか */
function shouldShowWorkPrice(work) {
  if (work && work.showPrice === false) return false;
  return Boolean(getWorkPriceAmount(work) || getWorkPriceIncludes(work));
}

/** 参考制作費の1行サマリー（例: ¥160,000（税込・目安）） */
function formatWorkPriceSummary(work) {
  const amount = getWorkPriceAmount(work);
  if (!amount) return "";

  const meta = [];
  const tax = getWorkPriceTax(work);
  if (tax) meta.push(tax);
  if (isWorkPriceEstimate(work)) meta.push("目安");

  if (meta.length === 0) return amount;
  return `${amount}（${meta.join("・")}）`;
}

/** 改行を含むテキストをHTML表示用に変換 */
function formatMultilineText(text) {
  if (text == null) return "";
  return escapeHtml(String(text)).replace(/\n/g, "<br>");
}

/** カテゴリバッジ（配列ならすべて表示） */
function renderCategoryBadge(category) {
  const labels = Array.isArray(category)
    ? category.map((c) => String(c).trim()).filter(Boolean)
    : category
      ? [String(category).trim()]
      : [];
  if (labels.length === 0) return "";

  const badges = labels
    .map((label) => `<span class="badge">${escapeHtml(label)}</span>`)
    .join("");

  if (labels.length === 1) return badges;
  return `<span class="badges">${badges}</span>`;
}

/** 記事カードHTML */
function renderArticleCard(post) {
  const imgUrl = getImageUrl(getBlogEyecatch(post), post.title);
  const date = getDisplayDate(post);
  const href = escapeHtml(getArticleUrl(post));

  return `
    <article class="card card--article">
      <a href="${href}" class="card__link">
        <div class="card__image-wrap">
          <img src="${escapeHtml(imgUrl)}" alt="" class="card__image" loading="lazy" width="400" height="225">
        </div>
        <div class="card__body">
          ${renderCategoryBadge(getBlogCategories(post))}
          <h3 class="card__title">${escapeHtml(post.title)}</h3>
          <p class="card__description">${escapeHtml(post.description || "")}</p>
          ${date ? `<time class="card__date" datetime="${escapeHtml(post.publishedAt || post.createdAt || "")}">${escapeHtml(date)}</time>` : ""}
        </div>
      </a>
    </article>
  `;
}

/** WorksカードHTML（詳細は work-detail.js のモーダル） */
function renderWorkCard(work) {
  const imgUrl = getImageUrl(work.thumbnail, work.title);
  const demoUrl = getSafeOptionalUrl(work.url, {
    allowRelative: false,
    allowedProtocols: ["http:", "https:"],
  });
  const demoBtn =
    demoUrl
      ? `<a href="${escapeHtml(demoUrl)}" class="btn btn--small btn--accent" target="_blank" rel="noopener noreferrer">デモを見る →</a>`
      : "";

  return `
    <article class="card card--work">
      <div class="card__image-wrap">
        <img src="${escapeHtml(imgUrl)}" alt="" class="card__image" loading="lazy" width="400" height="225">
      </div>
      <div class="card__body">
        ${renderCategoryBadge(getWorkCategories(work))}
        <h3 class="card__title">${escapeHtml(work.title)}</h3>
        <p class="card__description">${escapeHtml(work.description || "")}</p>
        <div class="card__actions">
          <button type="button" class="btn btn--small btn--secondary" data-work-detail="${escapeHtml(work.id)}">詳細を見る</button>
          ${demoBtn}
        </div>
      </div>
    </article>
  `;
}
