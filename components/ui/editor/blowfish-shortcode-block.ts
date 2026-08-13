import { mergeAttributes, Node } from "@tiptap/core";
import type {
  MarkdownParseHelpers,
  MarkdownToken,
  MarkdownTokenizer,
} from "@tiptap/core";

const SHORTCODE_START_PATTERN = /^\{\{([<%])\s*([A-Za-z][\w-]*)\b[^\n]*?([>%])\}\}[ \t]*(?:\n|$)/;

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getShortcodeToken = (src: string): MarkdownToken | undefined => {
  const opening = src.match(SHORTCODE_START_PATTERN);
  if (!opening) return undefined;

  const [, openingMarker, name, closingMarker] = opening;
  const expectedClosingMarker = openingMarker === "<" ? ">" : "%";
  if (closingMarker !== expectedClosingMarker) return undefined;

  const closingPattern = new RegExp(
    `^\\{\\{${escapeRegExp(openingMarker)}\\s*\\/${escapeRegExp(name)}\\s*${escapeRegExp(expectedClosingMarker)}\\}\\}[ \\t]*(?:\\n|$)`,
    "m",
  );
  const remainder = src.slice(opening[0].length);
  const closing = closingPattern.exec(remainder);
  const raw = closing
    ? src.slice(0, opening[0].length + (closing.index ?? 0) + closing[0].length)
    : opening[0];

  return {
    type: "blowfishShortcodeBlock",
    raw,
    text: raw.trimEnd(),
  };
};

const shortcodeTokenizer: MarkdownTokenizer = {
  name: "blowfishShortcodeBlock",
  level: "block",
  start(src) {
    const match = src.match(/^\{\{[<%]/m);
    return match?.index ?? -1;
  },
  tokenize(src) {
    return getShortcodeToken(src);
  },
};

const textContent = (content: unknown): string => {
  if (!Array.isArray(content)) return "";
  return content
    .map((child) =>
      child && typeof child === "object" && "text" in child
        ? String((child as { text?: unknown }).text ?? "")
        : "",
    )
    .join("");
};

/**
 * An editable preformatted block that round-trips Hugo/Blowfish shortcode
 * source without escaping it or wrapping it in Markdown code fences.
 */
const BlowfishShortcodeBlock = Node.create({
  name: "blowfishShortcodeBlock",
  group: "block",
  content: "text*",
  marks: "",
  code: true,
  defining: true,

  parseHTML() {
    return [{ tag: 'pre[data-blowfish-shortcode="true"]', preserveWhitespace: "full" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "pre",
      mergeAttributes(HTMLAttributes, {
        "data-blowfish-shortcode": "true",
        class:
          "my-2 overflow-x-auto whitespace-pre-wrap rounded-md border border-primary/25 bg-muted/60 px-3 py-2 font-mono text-sm",
        spellcheck: "false",
      }),
      ["code", 0],
    ];
  },

  markdownTokenName: "blowfishShortcodeBlock",
  markdownTokenizer: shortcodeTokenizer,
  parseMarkdown(token: MarkdownToken, helpers: MarkdownParseHelpers) {
    const source = String(token.text ?? token.raw ?? "").trimEnd();
    return helpers.createNode(
      "blowfishShortcodeBlock",
      {},
      source ? [helpers.createTextNode(source)] : [],
    );
  },
  renderMarkdown(node) {
    return textContent(node.content);
  },
});

export default BlowfishShortcodeBlock;
export { getShortcodeToken };
