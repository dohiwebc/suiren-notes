/**
 * ヘッダー：表示アニメーション・スクロール時のスタイル
 */
(function initHeader() {
  const header = document.querySelector(".header");
  if (!header) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollThreshold = 16;

  function updateScrollState() {
    header.classList.toggle("header--scrolled", window.scrollY > scrollThreshold);
  }

  function showHeader() {
    header.classList.add("header--ready");
  }

  if (reduceMotion) {
    showHeader();
  } else {
    requestAnimationFrame(showHeader);
  }

  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });
})();
