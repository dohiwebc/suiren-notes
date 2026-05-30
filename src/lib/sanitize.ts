import sanitizeHtml from "sanitize-html";

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
      img: ["src", "alt", "width", "height", "loading"],
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
      img: (_tagName, attribs) => ({
        tagName: "img",
        attribs: {
          ...attribs,
          loading: attribs.loading || "lazy",
        },
      }),
    },
  });
}
