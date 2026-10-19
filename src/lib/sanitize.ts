import sanitizeHtml from "sanitize-html";
import { optimizeMicroCMSImageUrl } from "./image";

/** CMSのリッチエディタHTMLを安全なタグだけに絞る */
export function sanitizeRichText(html: string | null | undefined): string {
  if (html == null) return "";

  return sanitizeHtml(String(html), {
    allowedTags: [
      "a",
      "b",
      "blockquote",
      "br",
      "code",
      "em",
      "figcaption",
      "figure",
      "h2",
      "h3",
      "h4",
      "hr",
      "i",
      "img",
      "li",
      "ol",
      "p",
      "pre",
      "s",
      "span",
      "strong",
      "table",
      "tbody",
      "td",
      "th",
      "thead",
      "tr",
      "u",
      "ul",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: [
        "src",
        "alt",
        "width",
        "height",
        "loading",
        "decoding",
        "srcset",
        "sizes",
      ],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: (_tagName, attribs) => {
        const href = attribs.href || "";
        if (attribs.target === "_blank") {
          return {
            tagName: "a",
            attribs: {
              ...attribs,
              rel: "noopener noreferrer",
            },
          };
        }
        return { tagName: "a", attribs: { href } };
      },
      img: (_tagName, attribs) => {
        const rawSrc = attribs.src || "";
        const optimized = optimizeMicroCMSImageUrl(rawSrc, {
          width: 960,
          format: "webp",
          quality: 72,
          fit: "max",
        });
        const srcset = [640, 960, 1280]
          .map(
            (w) =>
              `${optimizeMicroCMSImageUrl(rawSrc, {
                width: w,
                format: "webp",
                quality: 72,
                fit: "max",
              })} ${w}w`
          )
          .join(", ");

        return {
          tagName: "img",
          attribs: {
            ...attribs,
            src: optimized,
            srcset,
            sizes: "(max-width: 720px) 100vw, 640px",
            loading: attribs.loading || "lazy",
            decoding: "async",
          },
        };
      },
    },
  });
}
