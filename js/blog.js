/**
 * ブログ一覧ページ（blog/index.html）
 */

const BLOG_CATEGORIES = [
  "すべて",
  "N高",
  "スクーリング",
  "日常",
  "制作",
  "進路",
  "考えごと",
];

let allPosts = [];
let currentCategory = "すべて";

(async function initBlogPage() {
  const filterEl = document.getElementById("blog-filter");
  const listEl = document.getElementById("blog-list");

  if (!listEl) return;

  listEl.innerHTML = renderLoading();
  renderFilterButtons(filterEl);

  try {
    allPosts = await getBlogList();
    renderPostList(listEl);
  } catch (err) {
    console.error(err);
    listEl.innerHTML = renderErrorMessage("読み込みに失敗しました");
  }
})();

function renderFilterButtons(el) {
  if (!el) return;

  el.innerHTML = BLOG_CATEGORIES.map((cat) => {
    const active = cat === currentCategory ? " filter__btn--active" : "";
    const pressed = cat === currentCategory ? "true" : "false";
    return `<button type="button" class="filter__btn${active}" data-category="${escapeHtml(cat)}" aria-pressed="${pressed}">${escapeHtml(cat)}</button>`;
  }).join("");

  el.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-category]");
    if (!btn) return;

    currentCategory = btn.dataset.category;
    el.querySelectorAll(".filter__btn").forEach((b) => {
      const isActive = b.dataset.category === currentCategory;
      b.classList.toggle("filter__btn--active", isActive);
      b.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    const listEl = document.getElementById("blog-list");
    renderPostList(listEl);
  });
}

function renderPostList(el) {
  if (!el) return;

  let filtered = [...allPosts];

  if (currentCategory !== "すべて") {
    filtered = filtered.filter((p) => postMatchesBlogCategory(p, currentCategory));
  }

  filtered.sort(
    (a, b) =>
      new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt)
  );

  if (filtered.length === 0) {
    el.innerHTML = '<p class="message message--empty">まだ記事がありません</p>';
    return;
  }

  el.innerHTML = `<div class="card-grid card-grid--3">${filtered.map(renderArticleCard).join("")}</div>`;
}
