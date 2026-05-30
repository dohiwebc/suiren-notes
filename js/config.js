/**
 * サイト共通設定
 */
const SITE_CONFIG = {
  BASE_URL: "https://suiren08n.static.jp",
  OG_IMAGE: "https://suiren08n.static.jp/assets/images/suirennotes-OGP.png",
};

/**
 * microCMS 接続設定
 */
const MICROCMS_CONFIG = {
  SERVICE_DOMAIN: "suiren",
  // 公開フロントで使うため、microCMS側でGET専用・公開コンテンツ専用のキーに制限してください。
  API_KEY: "UChGfUBgseXegREAhQtCIw4h0EA5NOc2UtTm",
  ENDPOINTS: {
    BLOG: "blog",
    PROFILE: "profile",
    WORKS: "works",
    SITE_SETTINGS: "site-settings",
  },
};
