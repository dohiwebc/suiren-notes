import type { MicroCMSImage } from "./microcms";

export type MicroCMSImageOptions = {
  width?: number;
  height?: number;
  /** 既定: webp */
  format?: "webp" | "jpg" | "png" | "avif";
  /** 既定: 72 */
  quality?: number;
  fit?: "clip" | "crop" | "fill" | "max";
};

function getPlaceholderImage(label = "Suiren Notes"): string {
  const safeLabel = String(label)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <rect width="800" height="450" fill="#f0ebe3"/>
      <rect x="40" y="40" width="720" height="370" fill="none" stroke="#8ab6d6" stroke-width="1" opacity="0.5"/>
      <text x="400" y="240" text-anchor="middle" fill="#243b53" font-family="Georgia, serif" font-size="18" letter-spacing="4">${safeLabel}</text>
    </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** 画像URL取得（なければプレースホルダー） */
export function getImageUrl(
  imageField: MicroCMSImage | string | null | undefined,
  fallbackLabel = "Suiren Notes"
): string {
  const placeholder = getPlaceholderImage(fallbackLabel);
  if (typeof imageField === "string" && imageField.trim()) return imageField.trim();
  if (imageField && typeof imageField === "object" && imageField.url) {
    return String(imageField.url).trim();
  }
  return placeholder;
}

/** microCMS 画像CDN向けにリサイズ・WebP化（オリジナル直読みを避ける） */
export function optimizeMicroCMSImageUrl(
  url: string,
  options: MicroCMSImageOptions = {}
): string {
  if (!url || url.startsWith("data:") || url.startsWith("blob:")) return url;

  const isMicroCms =
    url.includes("microcms-assets.io") || url.includes("images.microcms.io");
  if (!isMicroCms) return url;

  try {
    const parsed = new URL(url);
    const { width, height, format = "webp", quality = 72, fit } = options;

    if (width) parsed.searchParams.set("w", String(Math.round(width)));
    if (height) parsed.searchParams.set("h", String(Math.round(height)));
    if (fit) parsed.searchParams.set("fit", fit);
    parsed.searchParams.set("fm", format);
    parsed.searchParams.set("q", String(quality));
    return parsed.href;
  } catch {
    return url;
  }
}

/** 取得＋最適化をまとめたヘルパー */
export function getOptimizedImageUrl(
  imageField: MicroCMSImage | string | null | undefined,
  fallbackLabel = "Suiren Notes",
  options: MicroCMSImageOptions = {}
): string {
  return optimizeMicroCMSImageUrl(getImageUrl(imageField, fallbackLabel), options);
}

/** srcset 用（例: 320 / 640 / 960） */
export function buildMicroCMSSrcSet(
  url: string,
  widths: number[],
  options: Omit<MicroCMSImageOptions, "width"> = {}
): string {
  if (!url || url.startsWith("data:")) return "";
  return widths
    .map((w) => `${optimizeMicroCMSImageUrl(url, { ...options, width: w })} ${w}w`)
    .join(", ");
}
