/**
 * 全ページ共通：スクロール表示アニメーション（動的コンテンツにも対応）
 */
(function initPageAnimations() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const STAGGER_STEP = 0.08;
  const observed = new WeakSet();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("reveal--visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
  );

  function applyReveal(el, variant = "", delayIndex = 0) {
    if (!el || observed.has(el)) return;
    if (el.closest(".header")) return;
    if (el.classList.contains("message--loading")) return;

    el.classList.add("reveal");
    if (variant) el.classList.add(variant);
    el.style.setProperty("--reveal-delay", `${delayIndex * STAGGER_STEP}s`);
    observed.add(el);
    observer.observe(el);
  }

  function scanCardGrids(root) {
    root.querySelectorAll(".card-grid").forEach((grid) => {
      grid.querySelectorAll(".card").forEach((card, index) => {
        applyReveal(card, "", index);
      });
    });
  }

  function scanPageHero(root) {
    root.querySelectorAll(".page-hero").forEach((hero) => {
      const children = [...hero.children].filter(
        (el) => !el.hidden && el.offsetParent !== null
      );
      children.forEach((child, index) => applyReveal(child, "", index));
    });
  }

  function scanRevealables(root = document) {
    const simpleSelectors = [
      ".section__header",
      ".section__more",
      ".hero__content",
      ".hero__visual",
      ".profile-mini",
      ".about-masthead",
      ".about-section",
      ".filter",
      ".article-page__nav",
      ".article__header",
      ".article__eyecatch",
      ".article__body",
      ".article__actions",
      ".works-coming-soon",
      ".link-card",
    ];

    simpleSelectors.forEach((selector) => {
      root.querySelectorAll(selector).forEach((el) => applyReveal(el));
    });

    scanPageHero(root);
    scanCardGrids(root);
    /* フッターは reveal しない（下端で intersection が効かずコピーライトが消えるため） */
  }

  let debounceTimer;
  function scheduleScan() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => scanRevealables(document), 80);
  }

  scanRevealables(document);

  const main = document.querySelector(".page__main");
  if (main) {
    const mutationObserver = new MutationObserver(scheduleScan);
    mutationObserver.observe(main, { childList: true, subtree: true });
  }

  window.refreshPageAnimations = scheduleScan;
})();
