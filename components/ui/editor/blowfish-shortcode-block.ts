import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import type {
  MarkdownParseHelpers,
  MarkdownToken,
  MarkdownTokenizer,
} from "@tiptap/core";
import BlowfishShortcodePreview from "./blowfish-shortcode-preview";

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

/**
 * A visual shortcode block that round-trips Hugo/Blowfish source without
 * escaping it or wrapping it in Markdown code fences.
 */
const BlowfishShortcodeBlock = Node.create({
  name: "blowfishShortcodeBlock",
  group: "block",
  atom: true,
  selectable: true,
  defining: true,

  addAttributes() {
    return {
      raw: {
        default: "",
        parseHTML: (element) => element.textContent ?? "",
      },
    };
  },

  parseHTML() {
    return [{ tag: 'pre[data-blowfish-shortcode="true"]', preserveWhitespace: "full" }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { raw: _rawAttribute, ...attributes } = HTMLAttributes;
    return [
      "pre",
      mergeAttributes(attributes, {
        "data-blowfish-shortcode": "true",
        class:
          "my-2 overflow-x-auto whitespace-pre-wrap rounded-md border border-primary/25 bg-muted/60 px-3 py-2 font-mono text-sm",
        spellcheck: "false",
      }),
      ["code", String(node.attrs.raw ?? "")],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BlowfishShortcodePreview);
  },

  markdownTokenName: "blowfishShortcodeBlock",
  markdownTokenizer: shortcodeTokenizer,
  parseMarkdown(token: MarkdownToken, helpers: MarkdownParseHelpers) {
    const source = String(token.text ?? token.raw ?? "").trimEnd();
    return helpers.createNode("blowfishShortcodeBlock", { raw: source });
  },
  renderMarkdown(node) {
    return String(node.attrs?.raw ?? "");
  },
});

export default BlowfishShortcodeBlock;
export { getShortcodeToken };
