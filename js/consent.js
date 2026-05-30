/**
 * Cookie 同意バナー（Google Analytics / Consent Mode）
 */
(function initCookieConsent() {
  const CONSENT_KEY =
    window.SUIREN_COOKIE_CONSENT_KEY || "suiren_cookie_consent";

  function getSavedConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch (err) {
      return null;
    }
  }

  function saveConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch (err) {
      /* private mode 等 */
    }
  }

  function applyConsent(value) {
    if (value === "granted" && typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: "granted" });
    }
  }

  function hideBanner(banner) {
    banner.hidden = true;
    document.body.classList.remove("cookie-consent-open");
  }

  function showBanner(banner) {
    banner.hidden = false;
    document.body.classList.add("cookie-consent-open");
  }

  function buildBanner() {
    const banner = document.createElement("div");
    banner.id = "cookie-consent";
    banner.className = "cookie-consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-labelledby", "cookie-consent-title");
    banner.setAttribute("aria-describedby", "cookie-consent-desc");
    banner.hidden = true;
    banner.innerHTML = `
      <div class="cookie-consent__inner container">
        <p id="cookie-consent-title" class="cookie-consent__title">Cookie の使用について</p>
        <p id="cookie-consent-desc" class="cookie-consent__text">
          当サイトではアクセス解析のため Cookie を使用します。詳細は
          <a href="#" data-cookie-privacy-link>プライバシーポリシー</a>をご覧ください。
        </p>
        <div class="cookie-consent__actions">
          <button type="button" class="btn btn--accent btn--small" data-consent="granted">同意する</button>
          <button type="button" class="btn btn--secondary btn--small" data-consent="denied">拒否する</button>
        </div>
      </div>
    `;
    const privacyHref =
      (typeof window !== "undefined" && window.SUIREN_PRIVACY_HREF) ||
      "/privacy.html";
    const privacyA = banner.querySelector("[data-cookie-privacy-link]");
    if (privacyA) privacyA.setAttribute("href", privacyHref);
    document.body.appendChild(banner);
    return banner;
  }

  const saved = getSavedConsent();
  const banner = document.getElementById("cookie-consent") || buildBanner();

  if (saved === "granted" || saved === "denied") {
    hideBanner(banner);
    return;
  }

  showBanner(banner);

  banner.addEventListener("click", (event) => {
    const button = event.target.closest("[data-consent]");
    if (!button) return;

    const value = button.getAttribute("data-consent");
    if (value !== "granted" && value !== "denied") return;

    saveConsent(value);
    applyConsent(value);
    hideBanner(banner);
  });
})();
