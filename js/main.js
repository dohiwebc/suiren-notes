/**
 * トップページ（index.html）
 */
(async function initIndexPage() {
  const heroEl = document.getElementById("hero");
  const profileMiniEl = document.getElementById("profile-mini");
  const latestPostsEl = document.getElementById("latest-posts");
  const pickupPostsEl = document.getElementById("pickup-posts");
  const featuredWorksEl = document.getElementById("featured-works");

  try {
    const [settings, profile, posts, works] = await Promise.all([
      getSiteSettings(),
      getProfile(),
      getBlogList({ limit: 10 }),
      getWorksList({ limit: 20 }),
    ]);

    renderHero(heroEl, settings);
    renderProfileMini(profileMiniEl, profile);
    renderLatestPosts(latestPostsEl, posts);
    renderPickupPosts(pickupPostsEl, posts);
    renderFeaturedWorks(featuredWorksEl, works, settings);
  } catch (err) {
    console.error(err);
    showPageError("読み込みに失敗しました。しばらくしてから再度お試しください。");
  }
})();

function renderHero(el, settings) {
  if (!el) return;

  const visualUrl = settings.mainVisual
    ? getImageUrl(settings.mainVisual, settings.siteTitle)
    : getPlaceholderImage(settings.siteTitle || "Suiren Notes");
  const primaryButtonUrl = getSafeUrl(settings.buttonUrl || "/blog/", "/blog/");
  const secondaryButtonUrl = getSafeUrl(settings.subButtonUrl || "/about/", "/about/");

  el.innerHTML = `
    <div class="hero__inner">
      <div class="hero__content">
        <p class="hero__site-title">${escapeHtml(settings.siteTitle || "Suiren Notes")}</p>
        <h1 class="hero__title">${escapeHtml(settings.heroTitle || "")}</h1>
        <p class="hero__text">${escapeHtml(settings.heroText || "")}</p>
        <div class="hero__actions">
          <a href="${escapeHtml(primaryButtonUrl)}" class="btn btn--primary">${escapeHtml(settings.buttonText || "最新記事を読む")}</a>
          <a href="${escapeHtml(secondaryButtonUrl)}" class="btn btn--secondary">${escapeHtml(settings.subButtonText || "自己紹介を見る")}</a>
        </div>
      </div>
      <div class="hero__visual">
        <img src="${escapeHtml(visualUrl)}" alt="" width="600" height="450" loading="eager">
      </div>
    </div>
  `;
}

function renderProfileMini(el, profile) {
  if (!el) return;

  const imgUrl = getImageUrl(profile.profileImage, profile.name);

  el.innerHTML = `
    <div class="profile-mini">
      <div class="profile-mini__image-wrap">
        <img class="profile-mini__image" src="${escapeHtml(imgUrl)}" alt="" width="120" height="150" loading="lazy">
      </div>
      <div class="profile-mini__content">
        <h2 class="profile-mini__name">${escapeHtml(profile.name || "")}</h2>
        <p class="profile-mini__catchcopy">${escapeHtml(profile.catchcopy || "")}</p>
        <p class="profile-mini__school">${escapeHtml(profile.school || "")}</p>
        <a href="/about/" class="btn btn--small btn--accent">もっと知る →</a>
      </div>
    </div>
  `;
}

function renderLatestPosts(el, posts) {
  if (!el) return;
  const latest = [...posts]
    .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt))
    .slice(0, 3);

  if (latest.length === 0) {
    el.innerHTML = '<p class="message message--empty">まだ記事がありません</p>';
    return;
  }

  el.innerHTML = `<div class="card-grid card-grid--3 card-grid--home">${latest.map(renderArticleCard).join("")}</div>`;
}

function renderPickupPosts(el, posts) {
  if (!el) return;
  const pickup = posts.filter((p) => p.isPickup).slice(0, 3);
  const section = document.getElementById("pickup-section");

  if (pickup.length === 0) {
    if (section) section.hidden = true;
    return;
  }

  if (section) section.hidden = false;
  el.innerHTML = `<div class="card-grid card-grid--3 card-grid--home">${pickup.map(renderArticleCard).join("")}</div>`;
}

function renderFeaturedWorks(el, works, settings) {
  if (!el) return;
  const section = document.getElementById("works-section");

  // Worksページが非公開のときはトップにも表示しない
  if (!isWorksEnabled(settings)) {
    if (section) section.hidden = true;
    return;
  }

  const publishedWorks = filterPublishedWorks(works);
  const featured = publishedWorks.filter((w) => w.isFeatured).slice(0, 3);
  registerWorksForDetail(publishedWorks);

  if (featured.length === 0) {
    if (section) section.hidden = true;
    return;
  }

  if (section) section.hidden = false;
  el.innerHTML = `<div class="card-grid card-grid--3 card-grid--home">${featured.map(renderWorkCard).join("")}</div>`;
}

function showPageError(message) {
  const main = document.querySelector(".page__main");
  if (!main) return;

  main.querySelectorAll(".message--loading").forEach((el) => {
    el.outerHTML = renderErrorMessage(message);
  });
}
