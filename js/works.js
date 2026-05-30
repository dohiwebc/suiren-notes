/**
 * 制作実績ページ（works/index.html）
 * site-settings で公開可否・Coming Soon文言・カテゴリ表示を制御します。
 */

const WORK_CATEGORIES = ["すべて", "WebApp", "LP", "Brand", "Portfolio", "Other"];

let allWorks = [];
let currentWorkCategory = "すべて";
let siteSettings = { ...FALLBACK_SITE_SETTINGS };

(async function initWorksPage() {
  const filterEl = document.getElementById("works-filter");
  const listEl = document.getElementById("works-list");
  const heroLeadEl = document.getElementById("works-hero-lead");
  const priceDisclaimerEl = document.getElementById("works-price-disclaimer");

  if (!listEl) return;

  listEl.innerHTML = renderLoading();
  if (filterEl) {
    filterEl.innerHTML = "";
    filterEl.hidden = true;
  }
  if (heroLeadEl) heroLeadEl.hidden = true;
  if (priceDisclaimerEl) priceDisclaimerEl.hidden = true;

  try {
    // サイト設定と制作実績を取得
    const [settings, works] = await Promise.all([getSiteSettings(), getWorksList()]);
    siteSettings = settings;
    renderWorksHeroLead(heroLeadEl, siteSettings);
    renderWorksPriceDisclaimer(priceDisclaimerEl, siteSettings);

    // worksEnabled が false → Coming Soon のみ表示
    if (!isWorksEnabled(siteSettings)) {
      renderComingSoonMode(listEl, filterEl);
      return;
    }

    // 公開モード：isPublished が true の作品だけ使う
    allWorks = filterPublishedWorks(works);
    registerWorksForDetail(allWorks);
    renderPublishedMode(listEl, filterEl);
  } catch (err) {
    console.error(err);
    listEl.innerHTML = renderErrorMessage("読み込みに失敗しました");
    if (filterEl) filterEl.hidden = true;
  }
})();

/** ヒーローリード：worksEnabled が true のときだけ表示 */
function renderWorksHeroLead(el, settings) {
  if (!el) return;

  if (!isWorksEnabled(settings)) {
    el.hidden = true;
    return;
  }

  const lead = getWorksLead(settings);
  if (!lead) {
    el.hidden = true;
    return;
  }

  el.innerHTML = formatMultilineText(lead);
  el.hidden = false;
}

/** 参考制作費の注釈（Works 公開時のみ） */
function renderWorksPriceDisclaimer(el, settings) {
  if (!el) return;

  if (!isWorksEnabled(settings)) {
    el.hidden = true;
    return;
  }

  const text = getWorksPriceDisclaimer(settings);
  if (!text) {
    el.hidden = true;
    return;
  }

  el.innerHTML = formatMultilineText(text);
  el.hidden = false;
}

/** Coming Soon 表示（実績・フィルター非表示） */
function renderComingSoonMode(listEl, filterEl) {
  if (filterEl) {
    filterEl.innerHTML = "";
    filterEl.hidden = true;
  }
  listEl.innerHTML = renderWorksComingSoon(siteSettings);
}

/** 公開モード（実績一覧を表示） */
function renderPublishedMode(listEl, filterEl) {
  currentWorkCategory = "すべて";

  if (isWorksCategoriesVisible(siteSettings)) {
    renderWorkFilter(filterEl);
  } else if (filterEl) {
    filterEl.innerHTML = "";
    filterEl.hidden = true;
  }

  renderWorksList(listEl);
}

/** カテゴリフィルターの描画 */
function renderWorkFilter(el) {
  if (!el) return;

  el.hidden = false;
  el.innerHTML = WORK_CATEGORIES.map((cat) => {
    const active = cat === currentWorkCategory ? " filter__btn--active" : "";
    const pressed = cat === currentWorkCategory ? "true" : "false";
    return `<button type="button" class="filter__btn${active}" data-category="${escapeHtml(cat)}" aria-pressed="${pressed}">${escapeHtml(cat)}</button>`;
  }).join("");

  // 二重登録を防ぐため、一度だけクリックイベントを付ける
  if (el.dataset.bound === "true") return;
  el.dataset.bound = "true";

  el.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-category]");
    if (!btn) return;

    currentWorkCategory = btn.dataset.category;
    el.querySelectorAll(".filter__btn").forEach((b) => {
      const isActive = b.dataset.category === currentWorkCategory;
      b.classList.toggle("filter__btn--active", isActive);
      b.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    renderWorksList(document.getElementById("works-list"));
  });
}

/** 制作実績一覧の描画 */
function renderWorksList(el) {
  if (!el) return;

  let filtered = [...allWorks];

  if (currentWorkCategory !== "すべて") {
    filtered = filtered.filter((w) => workMatchesCategory(w, currentWorkCategory));
  }

  if (filtered.length === 0) {
    el.innerHTML =
      '<p class="message message--empty">公開中の制作実績はまだありません</p>';
    return;
  }

  el.innerHTML = `<div class="card-grid card-grid--3">${filtered.map(renderWorkCard).join("")}</div>`;
}
