/**
 * 記事詳細ページ（article/index.html）
 */
(async function initArticlePage() {
  const contentEl = document.getElementById("article-content");
  const params = new URLSearchParams(window.location.search);
  const articleId =
    params.get("id") ||
    window.SUIREN_ARTICLE_ID ||
    (document.body && document.body.dataset.articleId) ||
    getArticleIdFromPath();

  if (!contentEl) return;

  if (!articleId) {
    contentEl.innerHTML = renderErrorMessage("記事IDが指定されていません");
    return;
  }

  cleanGeneratedArticleUrl(articleId);
  contentEl.innerHTML = renderLoading();

  try {
    const post = await getBlogPost(articleId);
    renderArticle(contentEl, post);
    setupArticleShare(contentEl, post);
    updateArticleMeta(post);
    renderRelatedArticles(contentEl, post, articleId);
  } catch (err) {
    console.error(err);
    contentEl.innerHTML = renderErrorMessage("記事が見つかりませんでした");
  }
})();

function getArticleIdFromPath() {
  const match = window.location.pathname.match(/\/articles\/([^/]+)\.html$/);
  return match ? decodeURIComponent(match[1]) : "";
}

function cleanGeneratedArticleUrl(articleId) {
  const pathArticleId = getArticleIdFromPath();
  const params = new URLSearchParams(window.location.search);
  if (!pathArticleId || pathArticleId !== articleId || !params.has("id")) return;

  const cleanUrl = `${window.location.pathname}${window.location.hash || ""}`;
  window.history.replaceState(null, "", cleanUrl);
}

function stripHtmlToText(html) {
  const div = document.createElement("div");
  div.innerHTML = sanitizeRichText(html || "");
  return div.textContent.replace(/\s+/g, " ").trim();
}

function getArticleDescription(post) {
  const description = String(post.description || "").trim();
  if (description) return description;
  return stripHtmlToText(post.body).slice(0, 120) || "Suiren Notes のブログ記事。";
}

function setMetaContent(attributeName, attributeValue, content) {
  if (!content) return;

  let meta = document.head.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attributeName, attributeValue);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

function setCanonicalUrl(url) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

function updateArticleMeta(post) {
  const title = `${post.title || "記事"} | Suiren Notes`;
  const description = getArticleDescription(post);
  const pageUrl = window.location.href;
  const imageUrl = getImageUrl(getBlogEyecatch(post), post.title);
  const absoluteImageUrl = imageUrl.startsWith("data:")
    ? ""
    : new URL(imageUrl, window.location.href).href;
  const defaultOgImage =
    typeof SITE_CONFIG !== "undefined" && SITE_CONFIG.OG_IMAGE ? SITE_CONFIG.OG_IMAGE : "";
  const shareImageUrl = absoluteImageUrl || defaultOgImage;

  document.title = title;
  setMetaContent("name", "description", description);
  setMetaContent("property", "og:title", title);
  setMetaContent("property", "og:description", description);
  setMetaContent("property", "og:type", "article");
  setMetaContent("property", "og:url", pageUrl);
  setMetaContent("name", "twitter:card", shareImageUrl ? "summary_large_image" : "summary");
  setMetaContent("name", "twitter:title", title);
  setMetaContent("name", "twitter:description", description);
  setCanonicalUrl(pageUrl);

  if (shareImageUrl) {
    setMetaContent("property", "og:image", shareImageUrl);
    setMetaContent("name", "twitter:image", shareImageUrl);
  }

  if (post.publishedAt) {
    setMetaContent("property", "article:published_time", post.publishedAt);
  }
  if (post.updatedAt) {
    setMetaContent("property", "article:modified_time", post.updatedAt);
  }
}

function renderArticleBackLink(href) {
  return `<a href="${escapeHtml(href)}" class="btn btn--secondary">← 記事一覧へ</a>`;
}

function renderArticle(el, post) {
  const imgUrl = getImageUrl(getBlogEyecatch(post), post.title);
  const date = getDisplayDate(post);
  const dateAttr = post.publishedAt || post.createdAt || "";
  const bodyHtml = sanitizeRichText(post.body || "<p>本文がありません。</p>");
  const shareLinks = getArticleShareLinks(post);
  const blogIndexHref =
    (typeof window !== "undefined" && window.SUIREN_BLOG_INDEX) || "/blog/";
  const backLink = renderArticleBackLink(blogIndexHref);

  el.innerHTML = `
    <div class="article-page">
      <nav class="article-page__nav" aria-label="記事ナビゲーション">
        ${backLink}
      </nav>
      <article class="article">
      <header class="article__header">
        <div class="article__meta-row">
          <div class="article__meta">
            ${renderCategoryBadge(getBlogCategories(post))}
            ${date ? `<time class="article__date" datetime="${escapeHtml(dateAttr)}">${escapeHtml(date)}</time>` : ""}
          </div>
          <button type="button" class="article__header-share" data-header-share aria-label="この記事を共有">
            ${renderShareIconSvg("article__header-share-icon")}
            <span class="visually-hidden">この記事を共有</span>
          </button>
        </div>
        <h1>${escapeHtml(post.title)}</h1>
      </header>
      <div class="article__eyecatch">
        <img src="${escapeHtml(imgUrl)}" alt="" width="800" height="450" loading="eager">
      </div>
      <div class="article__body rich-text">${bodyHtml}</div>
      <div class="article__share" aria-label="記事の共有">
        <p class="article__share-title">Share</p>
        <div class="article__share-buttons">
          <button type="button" class="article__share-btn article__share-btn--native" data-native-share hidden aria-label="共有メニューを開く">
            ${renderShareIconSvg("article__share-icon")}
          </button>
          <a href="${escapeHtml(shareLinks.line)}" class="article__share-btn article__share-btn--line" target="_blank" rel="noopener noreferrer" aria-label="LINEで共有">
            ${renderLineIconSvg("article__share-icon")}
          </a>
          <a href="${escapeHtml(shareLinks.x)}" class="article__share-btn article__share-btn--x" target="_blank" rel="noopener noreferrer" aria-label="Xで共有">
            ${renderXIconSvg("article__share-icon")}
          </a>
          <button type="button" class="article__share-btn article__share-btn--copy" data-copy-article-url aria-label="リンクをコピー">
            <span class="article__share-btn__state" data-copy-icon>${renderLinkIconSvg("article__share-icon")}</span>
            <span class="article__share-btn__state article__share-btn__state--check" data-check-icon hidden>${renderCheckIconSvg("article__share-icon")}</span>
          </button>
        </div>
        <span class="article__copy-status" data-copy-status aria-live="polite"></span>
        <input class="article__copy-url" type="text" value="${escapeHtml(getArticleShareUrl())}" data-copy-url readonly hidden aria-label="記事URL">
      </div>
      </article>
      <section id="related-articles" class="article__related" aria-labelledby="related-heading" hidden></section>
      <div class="article__actions">
        ${backLink}
      </div>
    </div>
  `;
}

function renderShareIconSvg(className = "article__share-icon") {
  return `<svg class="${escapeHtml(className)}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <path d="m8.59 13.51 6.83 3.98"></path>
    <path d="m15.41 6.51-6.82 3.98"></path>
  </svg>`;
}

/** LINE公式ロゴマーク（Simple Icons 準拠・モノトーン表示用） */
function renderLineIconSvg(className = "article__share-icon") {
  return `<svg class="${escapeHtml(className)}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path fill="currentColor" d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
  </svg>`;
}

function renderXIconSvg(className = "article__share-icon") {
  return `<svg class="${escapeHtml(className)}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.836-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>`;
}

function renderLinkIconSvg(className = "article__share-icon") {
  return `<svg class="${escapeHtml(className)}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>`;
}

function renderCheckIconSvg(className = "article__share-icon") {
  return `<svg class="${escapeHtml(className)}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6 9 17l-5-5"/>
  </svg>`;
}

function getArticleShareUrl() {
  const url = new URL(window.location.href);
  url.hash = "";
  return url.href;
}

function getArticleShareData(post) {
  const title = `${post.title || "記事"} | Suiren Notes`;
  const text = String(post.description || "").trim();

  return {
    title,
    text: text || title,
    url: getArticleShareUrl(),
  };
}

function getArticleShareLinks(post) {
  const shareData = getArticleShareData(post);
  const lineUrl = new URL("https://social-plugins.line.me/lineit/share");
  const xUrl = new URL("https://twitter.com/intent/tweet");

  lineUrl.searchParams.set("url", shareData.url);
  lineUrl.searchParams.set("text", shareData.title);
  xUrl.searchParams.set("text", shareData.title);
  xUrl.searchParams.set("url", shareData.url);

  return {
    line: lineUrl.href,
    x: xUrl.href,
  };
}

async function copyTextToClipboard(text) {
  const clipboard = window.navigator && window.navigator.clipboard;

  if (clipboard && window.isSecureContext) {
    await clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  const didCopy =
    typeof document.execCommand === "function" && document.execCommand("copy");
  textarea.remove();

  if (!didCopy) {
    throw new Error("リンクをコピーできませんでした");
  }
}

function setupArticleShare(rootEl, post) {
  const button = rootEl.querySelector("[data-copy-article-url]");
  const nativeShareButton = rootEl.querySelector("[data-native-share]");
  const headerShareButton = rootEl.querySelector("[data-header-share]");
  const statusEl = rootEl.querySelector("[data-copy-status]");
  const urlInput = rootEl.querySelector("[data-copy-url]");
  const navigatorApi = window.navigator || {};

  setupNativeShareButton(nativeShareButton, statusEl, navigatorApi, post);
  setupHeaderShareButton(headerShareButton, statusEl, urlInput, navigatorApi, post);
  if (!button) return;

  const copyIcon = button.querySelector("[data-copy-icon]");
  const checkIcon = button.querySelector("[data-check-icon]");

  button.addEventListener("click", async () => {
    const shareUrl = getArticleShareUrl();

    button.disabled = true;
    if (urlInput) urlInput.value = shareUrl;

    try {
      await copyTextToClipboard(shareUrl);
      button.classList.add("article__share-btn--copied");
      button.setAttribute("aria-label", "コピーしました");
      if (copyIcon) copyIcon.hidden = true;
      if (checkIcon) checkIcon.hidden = false;
      if (statusEl) statusEl.textContent = "この記事のリンクをコピーしました";
      if (urlInput) urlInput.hidden = true;
    } catch (err) {
      console.error(err);
      if (statusEl) statusEl.textContent = "URLを選択しました。手動でコピーしてください";
      if (urlInput) {
        urlInput.hidden = false;
        urlInput.focus();
        urlInput.select();
      }
    }

    window.setTimeout(() => {
      button.disabled = false;
      button.classList.remove("article__share-btn--copied");
      button.setAttribute("aria-label", "リンクをコピー");
      if (copyIcon) copyIcon.hidden = false;
      if (checkIcon) checkIcon.hidden = true;
      if (statusEl && urlInput && urlInput.hidden) statusEl.textContent = "";
    }, 2400);
  });
}

async function copyArticleUrlWithFeedback(button, statusEl, urlInput, successText, fallbackText) {
  const shareUrl = getArticleShareUrl();
  if (urlInput) urlInput.value = shareUrl;

  try {
    await copyTextToClipboard(shareUrl);
    if (statusEl) statusEl.textContent = successText;
    if (urlInput) urlInput.hidden = true;
    return true;
  } catch (err) {
    console.error(err);
    if (statusEl) statusEl.textContent = fallbackText;
    if (urlInput) {
      urlInput.hidden = false;
      urlInput.focus();
      urlInput.select();
    }
    return false;
  } finally {
    if (button) {
      window.setTimeout(() => {
        button.disabled = false;
        button.classList.remove("article__header-share--copied");
      }, 1800);
    }
  }
}

function setupHeaderShareButton(button, statusEl, urlInput, navigatorApi, post) {
  if (!button) return;

  button.addEventListener("click", async () => {
    button.disabled = true;

    if (typeof navigatorApi.share === "function") {
      try {
        await navigatorApi.share(getArticleShareData(post));
        button.disabled = false;
        return;
      } catch (err) {
        if (err && err.name === "AbortError") {
          button.disabled = false;
          return;
        }
        console.error(err);
      }
    }

    const didCopy = await copyArticleUrlWithFeedback(
      button,
      statusEl,
      urlInput,
      "この記事のリンクをコピーしました",
      "URLを選択しました。手動でコピーしてください"
    );
    if (didCopy) button.classList.add("article__header-share--copied");
  });
}

function setupNativeShareButton(button, statusEl, navigatorApi, post) {
  if (!button || typeof navigatorApi.share !== "function") return;

  button.hidden = false;
  button.addEventListener("click", async () => {
    try {
      await navigatorApi.share(getArticleShareData(post));
      if (statusEl) statusEl.textContent = "";
    } catch (err) {
      if (err && err.name === "AbortError") return;
      console.error(err);
      if (statusEl) statusEl.textContent = "共有メニューを開けませんでした";
    }
  });
}

function getRelatedBlogPosts(currentPost, posts, currentArticleId) {
  const categories = getBlogCategories(currentPost);
  if (categories.length === 0) return [];

  const categorySet = new Set(categories);
  const excludedIds = new Set(
    [currentArticleId, currentPost.id].filter(Boolean).map((id) => String(id))
  );

  return posts
    .filter((post) => post && !excludedIds.has(String(post.id)))
    .filter((post) => getBlogCategories(post).some((category) => categorySet.has(category)))
    .sort(
      (a, b) =>
        new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt)
    )
    .slice(0, 3);
}

async function renderRelatedArticles(rootEl, post, articleId) {
  const relatedEl = rootEl.querySelector("#related-articles");
  if (!relatedEl || getBlogCategories(post).length === 0) return;

  try {
    const posts = await getBlogList({ limit: 100 });
    const relatedPosts = getRelatedBlogPosts(post, posts, articleId);

    if (relatedPosts.length === 0) return;

    relatedEl.hidden = false;
    relatedEl.innerHTML = `
      <div class="article__related-header">
        <p class="article__related-label">${escapeHtml(getBlogCategories(post).join(" / "))}</p>
        <h2 id="related-heading" class="article__related-title">同じカテゴリの記事</h2>
      </div>
      <div class="card-grid card-grid--3 article__related-grid">
        ${relatedPosts.map(renderArticleCard).join("")}
      </div>
    `;
  } catch (err) {
    console.warn("同じカテゴリの記事を読み込めませんでした", err);
  }
}
