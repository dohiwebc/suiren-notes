/**
 * 制作実績の詳細モーダル
 */

const worksDetailStore = {};
let workDetailListenersReady = false;

/** 作品データを ID で引けるように登録 */
function registerWorksForDetail(works) {
  if (!Array.isArray(works)) return;
  works.forEach((work) => {
    if (work && work.id) {
      worksDetailStore[work.id] = work;
    }
  });
}

/** クリック監視を1回だけ設定 */
function setupWorkDetailListeners() {
  if (workDetailListenersReady) return;
  workDetailListenersReady = true;

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-work-detail]");
    if (!btn) return;

    e.preventDefault();
    const work = worksDetailStore[btn.getAttribute("data-work-detail")];
    if (work) {
      openWorkDetailModal(work);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeWorkDetailModal();
    }
  });
}

function ensureWorkDetailModal() {
  let modal = document.getElementById("work-detail-modal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "work-detail-modal";
  modal.className = "work-modal";
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="work-modal__backdrop" data-work-modal-close></div>
    <div class="work-modal__panel" role="dialog" aria-modal="true" aria-labelledby="work-modal-title">
      <button type="button" class="work-modal__close" data-work-modal-close aria-label="閉じる">×</button>
      <div class="work-modal__content" id="work-modal-content"></div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelectorAll("[data-work-modal-close]").forEach((el) => {
    el.addEventListener("click", closeWorkDetailModal);
  });

  return modal;
}

function openWorkDetailModal(work) {
  const modal = ensureWorkDetailModal();
  const contentEl = document.getElementById("work-modal-content");
  if (!contentEl) return;

  contentEl.innerHTML = renderWorkDetailContent(work);
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("work-modal-open");

  const closeBtn = modal.querySelector(".work-modal__close");
  if (closeBtn) closeBtn.focus();
}

function closeWorkDetailModal() {
  const modal = document.getElementById("work-detail-modal");
  if (!modal) return;

  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("work-modal-open");
}

function renderWorkDetailRow(label, valueHtml) {
  if (!valueHtml) return "";
  return `
    <div class="work-modal__row">
      <dt class="work-modal__label">${escapeHtml(label)}</dt>
      <dd class="work-modal__value">${valueHtml}</dd>
    </div>
  `;
}

function renderWorkDetailContent(work) {
  const imgUrl = getImageUrl(work.thumbnail, work.title);
  const techTags = Array.isArray(work.tech)
    ? work.tech.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")
    : "";
  const demoUrl = getSafeOptionalUrl(work.url, {
    allowRelative: false,
    allowedProtocols: ["http:", "https:"],
  });

  const demoBtn = demoUrl
    ? `<a href="${escapeHtml(demoUrl)}" class="btn btn--accent" target="_blank" rel="noopener noreferrer">デモを見る →</a>`
    : "";

  const projectTypes = getWorkProjectTypes(work);
  const categoryBadges = renderCategoryBadge(getWorkCategories(work));
  const rows = [];

  const period = getWorkPeriod(work);
  if (period) {
    rows.push(renderWorkDetailRow("制作期間", escapeHtml(period)));
  }

  if (techTags) {
    rows.push(renderWorkDetailRow("使用技術", `<div class="tags">${techTags}</div>`));
  }

  if (projectTypes.length === 1) {
    rows.push(renderWorkDetailRow("案件区分", escapeHtml(projectTypes[0])));
  } else if (projectTypes.length > 1) {
    rows.push(
      renderWorkDetailRow(
        "案件区分",
        projectTypes.map((type) => `<span class="tag">${escapeHtml(type)}</span>`).join(""),
      ),
    );
  }

  if (shouldShowWorkPrice(work)) {
    const summary = formatWorkPriceSummary(work);
    const includes = getWorkPriceIncludes(work);
    let priceHtml = "";

    if (summary) {
      priceHtml += `<p class="work-modal__price-summary">${escapeHtml(summary)}</p>`;
    }
    if (includes) {
      priceHtml += `<p class="work-modal__price-includes">${formatMultilineText(includes)}</p>`;
    }

    if (priceHtml) {
      rows.push(renderWorkDetailRow("参考制作費", priceHtml));
    }
  }

  const highlights = getWorkHighlights(work);
  const learnings = getWorkLearnings(work);

  const sections = [];

  if (highlights) {
    sections.push(`
      <section class="work-modal__section" aria-label="工夫した点">
        <h3 class="work-modal__section-title">工夫した点</h3>
        <div class="work-modal__section-body">${formatMultilineText(highlights)}</div>
      </section>
    `);
  }

  if (learnings) {
    sections.push(`
      <section class="work-modal__section" aria-label="学んだこと">
        <h3 class="work-modal__section-title">学んだこと</h3>
        <div class="work-modal__section-body">${formatMultilineText(learnings)}</div>
      </section>
    `);
  }

  const badgeWrap = categoryBadges
    ? `<div class="work-modal__badges">${categoryBadges}</div>`
    : "";

  return `
    <div class="work-modal__visual">
      <img src="${escapeHtml(imgUrl)}" alt="" width="640" height="360" loading="lazy">
    </div>
    <div class="work-modal__header">
      ${badgeWrap}
      <h2 id="work-modal-title" class="work-modal__title">${escapeHtml(work.title)}</h2>
    </div>
    <p class="work-modal__description">${formatMultilineText(work.description || "")}</p>
    ${rows.length ? `<dl class="work-modal__details">${rows.join("")}</dl>` : ""}
    ${sections.join("")}
    ${demoBtn ? `<div class="work-modal__actions">${demoBtn}</div>` : ""}
  `;
}

setupWorkDetailListeners();
