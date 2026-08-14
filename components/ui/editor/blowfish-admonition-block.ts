import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import type {
  MarkdownParseHelpers,
  MarkdownToken,
  MarkdownTokenizer,
} from "@tiptap/core";
import BlowfishAdmonitionPreview from "./blowfish-admonition-preview";

const ADMONITION_BLOCK_PATTERN =
  /^(>\s*\[![A-Za-z]+\][+-]?[^\r\n]*(?:\r?\n>[^\r\n]*)*(?:\r?\n\{icon=(?:"[^"]*"|'[^']*')\})?)[ \t]*(?:\r?\n|$)/;

const getAdmonitionToken = (src: string): MarkdownToken | undefined => {
  const match = src.match(ADMONITION_BLOCK_PATTERN);
  if (!match) return undefined;

  return {
    type: "blowfishAdmonitionBlock",
    raw: match[0],
    text: match[1].trimEnd(),
  };
};

const admonitionTokenizer: MarkdownTokenizer = {
  name: "blowfishAdmonitionBlock",
  level: "block",
  start(src) {
    const match = src.match(/^>\s*\[![A-Za-z]+\]/m);
    return match?.index ?? -1;
  },
  tokenize(src) {
    return getAdmonitionToken(src);
  },
};

const BlowfishAdmonitionBlock = Node.create({
  name: "blowfishAdmonitionBlock",
  priority: 1_000,
  group: "block",
  atom: true,
  selectable: true,
  defining: true,

  addAttributes() {
    return {
      raw: {
        default: "> [!TIP]\n> 在这里填写提示内容。",
        parseHTML: (element) => element.textContent ?? "",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'pre[data-blowfish-admonition="true"]',
        preserveWhitespace: "full",
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { raw: _rawAttribute, ...attributes } = HTMLAttributes;
    return [
      "pre",
      mergeAttributes(attributes, {
        "data-blowfish-admonition": "true",
        class:
          "my-2 whitespace-pre-wrap rounded-md border border-primary/25 bg-muted/60 px-3 py-2 font-mono text-sm",
        spellcheck: "false",
      }),
      ["code", String(node.attrs.raw ?? "")],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BlowfishAdmonitionPreview);
  },

  markdownTokenName: "blowfishAdmonitionBlock",
  markdownTokenizer: admonitionTokenizer,
  parseMarkdown(token: MarkdownToken, helpers: MarkdownParseHelpers) {
    return helpers.createNode("blowfishAdmonitionBlock", {
      raw: String(token.text ?? token.raw ?? "").trimEnd(),
    });
  },
  renderMarkdown(node) {
    return String(node.attrs?.raw ?? "");
  },
});

export default BlowfishAdmonitionBlock;
export { ADMONITION_BLOCK_PATTERN, getAdmonitionToken };
