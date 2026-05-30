/**
 * プロフィールページ（about/index.html）
 */
(async function initAboutPage() {
  const contentEl = document.getElementById("about-content");

  if (!contentEl) return;

  contentEl.innerHTML = renderLoading();

  try {
    const profile = await getProfile();
    renderAbout(contentEl, profile);
  } catch (err) {
    console.error(err);
    contentEl.innerHTML = renderErrorMessage("読み込みに失敗しました");
  }
})();

/**
 * About用セクション1つ分のHTML
 */
function renderAboutSection(num, title, idSuffix, htmlContent, extraClass = "") {
  const headingId = `about-${idSuffix}-title`;
  return `
    <section class="about-section ${extraClass}" aria-labelledby="${headingId}">
      <div class="about-section__head">
        <span class="about-section__num" aria-hidden="true">${num}</span>
        <h2 id="${headingId}" class="about-section__title">${escapeHtml(title)}</h2>
      </div>
      <div class="about-section__content rich-text">${sanitizeRichText(htmlContent)}</div>
    </section>
  `;
}

/** リッチエディタフィールド（空ならフォールバック） */
function getProfileRichField(profile, fieldName, fallbackHtml) {
  const value = profile && profile[fieldName];
  if (value && String(value).trim()) {
    return value;
  }
  return fallbackHtml;
}

function renderAbout(el, profile) {
  const imgUrl = getImageUrl(profile.profileImage, profile.name);

  const metaItems = [];
  if (profile.school) {
    metaItems.push(`<li class="about-meta__item">${escapeHtml(profile.school)}</li>`);
  }
  if (profile.location) {
    metaItems.push(`<li class="about-meta__item">${escapeHtml(profile.location)}</li>`);
  }

  const metaHtml = metaItems.length > 0 ? `<ul class="about-meta">${metaItems.join("")}</ul>` : "";

  const sections = [
    renderAboutSection(
      "01",
      "プロフィール",
      "bio",
      getProfileRichField(profile, "bio", "<p>プロフィールを準備中です。</p>")
    ),
    renderAboutSection(
      "02",
      "いまやっていること",
      "current",
      getProfileRichField(
        profile,
        "currentActivities",
        FALLBACK_PROFILE.currentActivities
      )
    ),
    renderAboutSection(
      "03",
      "N高を選んだ理由",
      "why-nhigh",
      getProfileRichField(profile, "whyNHigh", FALLBACK_PROFILE.whyNHigh)
    ),
    renderAboutSection(
      "04",
      "TikTokとの違い",
      "media",
      getProfileRichField(profile, "mediaDifference", FALLBACK_PROFILE.mediaDifference)
    ),
  ].join("");

  el.innerHTML = `
    <div class="about__inner">
      <header class="about-masthead">
        <div class="about-masthead__visual">
          <div class="about-masthead__image-wrap">
            <img class="about-masthead__image" src="${escapeHtml(imgUrl)}" alt="" width="200" height="250" loading="eager">
          </div>
        </div>
        <div class="about-masthead__intro">
          <p class="about-masthead__label">Profile</p>
          <h1 class="about-masthead__name">${escapeHtml(profile.name || "")}</h1>
          <p class="about-masthead__catchcopy">${escapeHtml(profile.catchcopy || "")}</p>
          ${metaHtml}
        </div>
      </header>

      <div class="about-body">
        ${sections}
      </div>
    </div>
  `;
}
