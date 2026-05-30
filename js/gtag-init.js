/**
 * Google Analytics（Consent Mode 既定: 拒否、保存済み同意を反映）
 */
(function initGtag() {
  const GA_ID = "G-7KJFFELQMB";
  const CONSENT_KEY = "suiren_cookie_consent";

  window.SUIREN_COOKIE_CONSENT_KEY = CONSENT_KEY;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });

  try {
    if (localStorage.getItem(CONSENT_KEY) === "granted") {
      gtag("consent", "update", { analytics_storage: "granted" });
    }
  } catch (err) {
    /* private mode 等 */
  }

  gtag("js", new Date());
  gtag("config", GA_ID);
})();
