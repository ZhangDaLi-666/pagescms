import { ReactRenderer } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import CommandsList, { type CommandsListHandle, type SlashItem } from "./commands-list";
import { Code, Heading1, Heading2, Heading3, Image, List, ListOrdered, Pilcrow, Quote, Table } from "lucide-react";
import type { SuggestionOptions as TiptapSuggestionOptions } from "@tiptap/suggestion";
import blowfishTemplates from "./blowfish-templates";

export type ImagePickerUrlResult = {
  kind: "url";
  src: string;
  alt?: string;
  title?: string;
};

export type ImagePickerFileResult = {
  kind: "file";
  file: File;
  alt?: string;
  title?: string;
};

export type ImagePickerResult = ImagePickerUrlResult | ImagePickerFileResult;

export type ImagePickerContext = {
  editor: Editor;
  range: { from: number; to: number };
};

export type ImagePickerHandler = (
  context: ImagePickerContext,
) => ImagePickerResult | null | Promise<ImagePickerResult | null>;

export type SlashImageFallback = "prompt-url" | "none";

type SuggestionOptions = {
  onRequestImage?: ImagePickerHandler | null;
  onInsertLocalImageFile?: ((context: ImagePickerContext & Omit<ImagePickerFileResult, "kind">) => void | Promise<void>) | null;
  enableImages?: boolean;
  imageSlashFallback?: SlashImageFallback;
  enableBlowfishShortcodes?: boolean;
};

const insertBlowfishTemplate = ({
  editor,
  range,
  template,
}: {
  editor: Editor;
  range: { from: number; to: number };
  template: string;
}) => {
  if (!template.trimStart().startsWith("{{")) {
    editor.chain().focus().deleteRange(range).run();
    editor.commands.insertContent(template, { contentType: "markdown" });
    return;
  }

  editor
    .chain()
    .focus()
    .deleteRange(range)
    .insertContent([
      {
        type: "blowfishShortcodeBlock",
        content: [{ type: "text", text: template }],
      },
      { type: "paragraph" },
    ])
    .run();
};

type RequestImageAndInsertArgs = ImagePickerContext & {
  onRequestImage: ImagePickerHandler | null;
  onInsertLocalImageFile: ((context: ImagePickerContext & Omit<ImagePickerFileResult, "kind">) => void | Promise<void>) | null;
  imageSlashFallback: SlashImageFallback;
};

const requestImageAndInsert = async ({
  editor,
  range,
  onRequestImage,
  onInsertLocalImageFile,
  imageSlashFallback = "prompt-url",
}: RequestImageAndInsertArgs): Promise<void> => {
  editor.chain().focus().deleteRange(range).run();

  let result: ImagePickerResult | null = null;
  if (onRequestImage) {
    result = await onRequestImage({ editor, range });
  } else if (imageSlashFallback === "prompt-url") {
    const src = window.prompt("Image URL")?.trim();
    result = src ? { kind: "url", src } : null;
  }

  if (!result) return;

  if (result.kind === "file") {
    if (!onInsertLocalImageFile) return;
    const fileInsertContext: ImagePickerContext & Omit<ImagePickerFileResult, "kind"> = {
      editor,
      range,
      file: result.file,
      ...(result.alt ? { alt: result.alt } : {}),
      ...(result.title ? { title: result.title } : {}),
    };
    await onInsertLocalImageFile(fileInsertContext);
    return;
  }

  const imageAttrs = {
    src: result.src,
    ...(result.alt ? { alt: result.alt } : {}),
    ...(result.title ? { title: result.title } : {}),
  };

  editor
    .chain()
    .focus()
    .setImage(imageAttrs)
    .run();
};

const getAllItems = (options: SuggestionOptions): SlashItem[] => [
  {
    id: "text",
    title: "Text",
    description: "普通正文段落",
    group: "基础格式",
    searchTerms: ["文本", "正文", "paragraph"],
    icon: Pilcrow,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    id: "heading-1",
    title: "Heading 1",
    description: "一级标题",
    group: "基础格式",
    searchTerms: ["标题", "h1"],
    icon: Heading1,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
  },
  {
    id: "heading-2",
    title: "Heading 2",
    description: "二级标题",
    group: "基础格式",
    searchTerms: ["标题", "h2"],
    icon: Heading2,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    id: "heading-3",
    title: "Heading 3",
    description: "三级标题",
    group: "基础格式",
    searchTerms: ["标题", "h3"],
    icon: Heading3,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
  },
  {
    id: "bullet-list",
    title: "Bulleted list",
    description: "无序列表",
    group: "基础格式",
    searchTerms: ["列表", "项目符号", "ul"],
    icon: List,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    id: "numbered-list",
    title: "Numbered list",
    description: "有序列表",
    group: "基础格式",
    searchTerms: ["列表", "编号", "ol"],
    icon: ListOrdered,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    id: "image",
    title: "Image",
    description: "上传或插入一张图片",
    group: "基础格式",
    searchTerms: ["图片", "照片", "photo"],
    tableSafe: true,
    icon: Image,
    command: ({ editor, range }) => {
      void requestImageAndInsert({
        editor,
        range,
        onRequestImage: options.onRequestImage ?? null,
        onInsertLocalImageFile: options.onInsertLocalImageFile ?? null,
        imageSlashFallback: options.imageSlashFallback ?? "prompt-url",
      });
    },
  },
  {
    id: "table",
    title: "Table",
    description: "插入 3 × 3 Markdown 表格",
    group: "基础格式",
    searchTerms: ["表格"],
    icon: Table,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    id: "quote",
    title: "Quote",
    description: "引用内容",
    group: "基础格式",
    searchTerms: ["引用", "blockquote"],
    icon: Quote,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    id: "code-block",
    title: "Code block",
    description: "多行代码块",
    group: "基础格式",
    searchTerms: ["代码", "源码"],
    icon: Code,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  ...(options.enableBlowfishShortcodes === false
    ? []
    : blowfishTemplates.map((item): SlashItem => ({
        id: item.shortcode,
        title: item.title,
        description: item.description,
        group: "Blowfish 组件",
        searchTerms: [item.shortcode, ...item.keywords],
        icon: item.icon,
        command: ({ editor, range }) =>
          insertBlowfishTemplate({ editor, range, template: item.template }),
      }))),
];

type SlashSuggestion = Pick<TiptapSuggestionOptions, "items" | "render">;
type SuggestionRenderLifecycle = NonNullable<ReturnType<NonNullable<SlashSuggestion["render"]>>>;
type SuggestionKeyDownProps = Parameters<NonNullable<SuggestionRenderLifecycle["onKeyDown"]>>[0];

const createSuggestion = (options: SuggestionOptions = {}): SlashSuggestion => ({
  items: ({ query, editor }: { query: string; editor: Editor }) => {
    const isInTableCell = editor.isActive("tableCell") || editor.isActive("tableHeader");
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return getAllItems(options)
      .filter((item) => !isInTableCell || item.tableSafe)
      .filter((item) => options.enableImages !== false || item.title !== "Image")
      .filter((item) => {
        if (!normalizedQuery) return true;
        return [item.title, item.description ?? "", item.id, ...(item.searchTerms ?? [])]
          .join(" ")
          .toLocaleLowerCase()
          .includes(normalizedQuery);
      });
  },

  render: (): SuggestionRenderLifecycle => {
    let component: ReactRenderer<CommandsListHandle> | null = null;
    let popup: TippyInstance | null = null;

    return {
      onStart: (props) => {
        component = new ReactRenderer(CommandsList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) return;
        const referenceRect = () => props.clientRect?.() ?? new DOMRect(0, 0, 0, 0);

        popup = tippy(document.body, {
          getReferenceClientRect: referenceRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },

      onUpdate: (props) => {
        if (!component) return;
        component.updateProps(props);
        if (!props.clientRect || !popup) return;
        const referenceRect = () => props.clientRect?.() ?? new DOMRect(0, 0, 0, 0);
        popup.setProps({ getReferenceClientRect: referenceRect });
      },

      onKeyDown: ({ event }: SuggestionKeyDownProps): boolean => {
        if (event.key === "Escape" && popup) {
          popup.hide();
          return true;
        }

        return component?.ref?.onKeyDown(event) ?? false;
      },

      onExit: (): void => {
        if (popup && !popup.state.isDestroyed) popup.destroy();
        popup = null;
        component?.destroy();
        component = null;
      },
    };
  },
});

export default createSuggestion;
