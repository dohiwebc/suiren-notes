/**
 * SNSリンクページ（links.html）
 */
(async function initLinksPage() {
  const listEl = document.getElementById("links-list");

  if (!listEl) return;

  listEl.innerHTML = renderLoading();

  try {
    const profile = await getProfile();
    renderLinksList(listEl, profile);
  } catch (err) {
    console.error(err);
    listEl.innerHTML = renderErrorMessage("読み込みに失敗しました");
  }
})();

function renderLinksList(el, profile) {
  const links = getSnsLinks(profile);

  if (links.length === 0) {
    el.innerHTML = '<p class="message message--empty">リンクはまだ登録されていません</p>';
    return;
  }

  el.innerHTML = `
    <div class="link-cards">
      ${links
        .map((link) => {
          const safeUrl = getSafeOptionalUrl(link.url, {
            allowRelative: false,
            allowedProtocols: ["http:", "https:"],
          });
          if (!safeUrl) return "";

          return `
        <a href="${escapeHtml(safeUrl)}" class="link-card" target="_blank" rel="noopener noreferrer">
          <span>${escapeHtml(link.label)}</span>
          <span class="link-card__arrow" aria-hidden="true">→</span>
        </a>
      `;
        })
        .join("")}
    </div>
  `;
}
