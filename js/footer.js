/**
 * 全ページ共通フッター（年表示・TikTokアイコン）
 */
(async function initFooter() {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const tiktokEl = document.getElementById("footer-tiktok");
  if (!tiktokEl) return;

  try {
    const profile = await getProfile();
    const html = renderTikTokIconLink(profile, "tiktok-link tiktok-link--footer");
    if (html) {
      tiktokEl.innerHTML = html;
      tiktokEl.hidden = false;
    } else {
      tiktokEl.innerHTML = "";
      tiktokEl.hidden = true;
    }
  } catch (err) {
    console.error(err);
    tiktokEl.hidden = true;
  }

  if (typeof window.refreshPageAnimations === "function") {
    window.refreshPageAnimations();
  }
})();
