"use client";

import { useMemo, useState, type ReactNode } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import {
  ChevronDown,
  CircleAlert,
  Code2,
  Eye,
  FileImage,
  Film,
  Github,
  Network,
  Plus,
  Puzzle,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const BLOWFISH_ICONS = [
  "a11y",
  "amazon",
  "ansible",
  "apple",
  "bars",
  "bell",
  "blogger",
  "bluesky",
  "bomb",
  "bug",
  "check",
  "chevron-down",
  "circle-info",
  "circle-question",
  "cloud",
  "cloud-moon",
  "code",
  "codeberg",
  "codepen",
  "comment",
  "dev",
  "discord",
  "discourse",
  "docker",
  "download",
  "dribbble",
  "edit",
  "email",
  "envelope",
  "expand",
  "eye",
  "facebook",
  "fediverse",
  "file-lines",
  "fire",
  "flickr",
  "forgejo",
  "fork",
  "foursquare",
  "ghost",
  "gitea",
  "github",
  "gitlab",
  "globe",
  "goodreads",
  "google",
  "google-scholar",
  "graduation-cap",
  "hackernews",
  "hashnode",
  "heart",
  "heart-empty",
  "image",
  "instagram",
  "itch-io",
  "keybase",
  "keyoxide",
  "kickstarter",
  "ko-fi",
  "language",
  "lastfm",
  "lightbulb",
  "line",
  "link",
  "linkedin",
  "list",
  "list-check",
  "list-ol",
  "location-dot",
  "lock",
  "mastodon",
  "matrix",
  "medium",
  "microsoft",
  "moon",
  "mug-hot",
  "music",
  "orcid",
  "patreon",
  "paypal",
  "peertube",
  "pencil",
  "pgpkey",
  "phone",
  "pinterest",
  "pixelfed",
  "poo",
  "printables",
  "quote-left",
  "reddit",
  "researchgate",
  "rss",
  "rss-square",
  "scale-balanced",
  "search",
  "shield",
  "signal",
  "skull-crossbones",
  "slack",
  "snapchat",
  "soundcloud",
  "spotify",
  "stack-overflow",
  "star",
  "steam",
  "strava",
  "stripe",
  "substack",
  "sun",
  "tag",
  "telegram",
  "threads",
  "tiktok",
  "triangle-exclamation",
  "tumblr",
  "twitch",
  "twitter",
  "untappd",
  "wand-magic-sparkles",
  "whatsapp",
  "worktree",
  "xing",
  "xmark",
  "x-twitter",
  "youtube",
] as const;

const COMPONENT_LABELS: Record<string, string> = {
  alert: "醒目框",
  lead: "开篇语",
  badge: "徽章",
  button: "按钮",
  article: "文章卡片",
  list: "文章列表",
  accordion: "折叠面板",
  tabs: "标签页",
  timeline: "时间线",
  keywordList: "关键字组",
  icon: "图标",
  figure: "图片",
  gallery: "排布画册",
  carousel: "滑动画册",
  screenshot: "截图",
  mermaid: "Mermaid 图表",
  chart: "Chart.js 图表",
  katex: "数学公式",
  swatches: "色板",
  github: "GitHub 仓库",
  gist: "GitHub Gist",
  gitlab: "GitLab 项目",
  codeberg: "Codeberg 仓库",
  gitea: "Gitea 仓库",
  forgejo: "Forgejo 仓库",
  huggingface: "Hugging Face",
  ansible: "Ansible Galaxy",
  codeimporter: "代码导入",
  mdimporter: "Markdown 导入",
  typeit: "打字机效果",
  video: "视频播放器",
  youtubeLite: "YouTube Lite",
  youtube: "YouTube",
  vimeo_simple: "Vimeo",
  twitter_simple: "X / Twitter",
  email: "邮箱链接",
  rtl: "从右向左文本",
  ltr: "从左向右文本",
};

type ParsedShortcode = {
  name: string;
  params: Record<string, string>;
  positional: string[];
  inner: string;
  marker: "<" | "%";
  paired: boolean;
};

type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "icon"
  | "color";

type FieldDefinition = {
  key: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  help?: string;
};

const BOOLEAN_OPTIONS = [
  { label: "默认", value: "" },
  { label: "是", value: "true" },
  { label: "否", value: "false" },
];

const PARAMETER_FIELDS: Record<string, FieldDefinition[]> = {
  alert: [
    { key: "icon", label: "图标", type: "icon" },
    {
      key: "cardColor",
      label: "背景颜色",
      type: "color",
      placeholder: "#fef3c7",
    },
    {
      key: "iconColor",
      label: "图标颜色",
      type: "color",
      placeholder: "#d97706",
    },
    {
      key: "textColor",
      label: "文字颜色",
      type: "color",
      placeholder: "#78350f",
    },
  ],
  button: [
    { key: "href", label: "外部链接", placeholder: "https://example.com" },
    {
      key: "pageRef",
      label: "站内页面",
      placeholder: "/posts/example/",
      help: "站内页面会优先于外部链接",
    },
    {
      key: "target",
      label: "打开方式",
      type: "select",
      options: [
        { label: "当前页面", value: "" },
        { label: "新窗口", value: "_blank" },
        { label: "当前窗口", value: "_self" },
      ],
    },
    { key: "rel", label: "链接关系", placeholder: "noopener noreferrer" },
  ],
  article: [
    { key: "link", label: "文章路径", placeholder: "/posts/example/" },
    {
      key: "showSummary",
      label: "显示简介",
      type: "select",
      options: BOOLEAN_OPTIONS,
    },
    {
      key: "compactSummary",
      label: "紧凑简介",
      type: "select",
      options: BOOLEAN_OPTIONS,
    },
  ],
  list: [
    { key: "title", label: "列表标题", placeholder: "最近文章" },
    {
      key: "cardView",
      label: "卡片布局",
      type: "select",
      options: BOOLEAN_OPTIONS,
    },
    { key: "limit", label: "文章数量", type: "number", placeholder: "6" },
    { key: "where", label: "筛选字段", placeholder: "Params.categories" },
    { key: "value", label: "筛选值", placeholder: "随笔" },
  ],
  figure: [
    { key: "src", label: "图片地址", placeholder: "image.jpg" },
    { key: "alt", label: "替代文字", placeholder: "描述图片内容" },
    { key: "caption", label: "图片说明" },
    { key: "href", label: "点击链接" },
    {
      key: "target",
      label: "链接打开方式",
      type: "select",
      options: [
        { label: "新窗口（默认）", value: "" },
        { label: "新窗口", value: "_blank" },
        { label: "当前窗口", value: "_self" },
      ],
    },
    { key: "class", label: "图片 CSS 类" },
    { key: "figureClass", label: "外层 CSS 类" },
    {
      key: "nozoom",
      label: "禁用放大",
      type: "select",
      options: BOOLEAN_OPTIONS,
    },
    {
      key: "default",
      label: "使用 Hugo 默认样式",
      type: "select",
      options: BOOLEAN_OPTIONS,
    },
  ],
  screenshot: [
    { key: "src", label: "截图地址", placeholder: "screenshot.png" },
    { key: "alt", label: "替代文字" },
    { key: "caption", label: "截图说明" },
    { key: "href", label: "点击链接" },
    { key: "class", label: "CSS 类" },
  ],
  carousel: [
    {
      key: "images",
      label: "图片列表",
      placeholder: "{gallery/01.jpg,gallery/02.jpg}",
      help: "使用大括号包住，图片之间用英文逗号分隔",
    },
    {
      key: "captions",
      label: "图片说明",
      placeholder: "{01.jpg:说明一,02.jpg:说明二}",
    },
    {
      key: "aspectRatio",
      label: "宽高比",
      type: "select",
      options: [
        { label: "16:9", value: "16-9" },
        { label: "4:3", value: "4-3" },
        { label: "3:2", value: "3-2" },
        { label: "1:1", value: "1-1" },
      ],
    },
    {
      key: "interval",
      label: "切换间隔（毫秒）",
      type: "number",
      placeholder: "2000",
    },
  ],
  github: [
    { key: "repo", label: "仓库", placeholder: "owner/repository" },
    {
      key: "showThumbnail",
      label: "显示缩略图",
      type: "select",
      options: BOOLEAN_OPTIONS,
    },
  ],
  gitlab: [
    { key: "projectID", label: "项目 ID" },
    { key: "baseURL", label: "GitLab 地址", placeholder: "https://gitlab.com" },
  ],
  codeberg: [{ key: "repo", label: "仓库", placeholder: "owner/repository" }],
  gitea: [
    { key: "server", label: "服务器地址" },
    { key: "repo", label: "仓库" },
  ],
  forgejo: [
    { key: "server", label: "服务器地址" },
    { key: "repo", label: "仓库" },
  ],
  huggingface: [
    { key: "model", label: "模型" },
    { key: "dataset", label: "数据集" },
  ],
  ansible: [
    { key: "role", label: "Role" },
    { key: "collection", label: "Collection" },
  ],
  codeimporter: [
    { key: "url", label: "源文件地址" },
    { key: "type", label: "代码语言", placeholder: "javascript" },
    { key: "startLine", label: "开始行", type: "number", placeholder: "1" },
    { key: "endLine", label: "结束行", type: "number", placeholder: "20" },
  ],
  mdimporter: [{ key: "url", label: "Markdown 地址" }],
  typeit: [
    {
      key: "tag",
      label: "HTML 标签",
      type: "select",
      options: ["span", "p", "h2", "h3", "h4"].map((value) => ({
        label: value,
        value,
      })),
    },
    { key: "speed", label: "打字速度", type: "number", placeholder: "75" },
    { key: "startDelay", label: "开始延迟", type: "number" },
    {
      key: "breakLines",
      label: "保留换行",
      type: "select",
      options: BOOLEAN_OPTIONS,
    },
    {
      key: "lifeLike",
      label: "模拟真人速度",
      type: "select",
      options: BOOLEAN_OPTIONS,
    },
    {
      key: "loop",
      label: "循环播放",
      type: "select",
      options: BOOLEAN_OPTIONS,
    },
    {
      key: "randomLines",
      label: "随机行",
      type: "select",
      options: BOOLEAN_OPTIONS,
    },
    {
      key: "waitUntilVisible",
      label: "可见后开始",
      type: "select",
      options: BOOLEAN_OPTIONS,
    },
    { key: "initialString", label: "初始文字" },
    { key: "class", label: "CSS 类" },
  ],
  video: [
    { key: "src", label: "视频地址", placeholder: "video.mp4" },
    { key: "poster", label: "封面图片" },
    { key: "caption", label: "视频说明" },
    {
      key: "controls",
      label: "显示控制条",
      type: "select",
      options: BOOLEAN_OPTIONS,
    },
    {
      key: "autoplay",
      label: "自动播放",
      type: "select",
      options: BOOLEAN_OPTIONS,
    },
    {
      key: "loop",
      label: "循环播放",
      type: "select",
      options: BOOLEAN_OPTIONS,
    },
    { key: "muted", label: "静音", type: "select", options: BOOLEAN_OPTIONS },
    {
      key: "playsinline",
      label: "手机内联播放",
      type: "select",
      options: BOOLEAN_OPTIONS,
    },
    {
      key: "preload",
      label: "预加载",
      type: "select",
      options: ["", "none", "metadata", "auto"].map((value) => ({
        label: value || "默认",
        value,
      })),
    },
    { key: "ratio", label: "宽高比", placeholder: "16/9" },
    {
      key: "fit",
      label: "填充方式",
      type: "select",
      options: ["", "contain", "cover", "fill"].map((value) => ({
        label: value || "默认",
        value,
      })),
    },
    { key: "start", label: "开始时间（秒）", type: "number" },
    { key: "end", label: "结束时间（秒）", type: "number" },
  ],
  youtubeLite: [
    { key: "id", label: "视频 ID" },
    { key: "params", label: "播放器参数" },
  ],
  twitter_simple: [
    { key: "user", label: "用户名" },
    { key: "id", label: "帖子 ID" },
  ],
  email: [
    { key: "email", label: "邮箱" },
    { key: "subject", label: "主题" },
    { key: "text", label: "显示文字" },
  ],
};

const POSITIONAL_FIELDS: Record<string, FieldDefinition[]> = {
  icon: [{ key: "0", label: "图标", type: "icon" }],
  youtube: [{ key: "0", label: "YouTube 视频 ID" }],
  vimeo_simple: [{ key: "0", label: "Vimeo 视频 ID" }],
  gist: [
    { key: "0", label: "用户名" },
    { key: "1", label: "Gist ID" },
    { key: "2", label: "文件名（可选）" },
  ],
  swatches: [
    { key: "0", label: "颜色一", type: "color" },
    { key: "1", label: "颜色二", type: "color" },
    { key: "2", label: "颜色三", type: "color" },
  ],
};

const BODY_FIELDS: Record<string, FieldDefinition> = {
  alert: { key: "inner", label: "内容", type: "textarea" },
  lead: { key: "inner", label: "开篇文字", type: "textarea" },
  badge: { key: "inner", label: "徽章文字" },
  button: { key: "inner", label: "按钮文字" },
  gallery: {
    key: "inner",
    label: "图片 HTML",
    type: "textarea",
    help: "每张图片使用一个 <img> 标签，可继续用源码模式处理复杂排版",
  },
  mermaid: { key: "inner", label: "Mermaid 源码", type: "textarea" },
  chart: { key: "inner", label: "Chart.js 配置", type: "textarea" },
  katex: { key: "inner", label: "数学公式", type: "textarea" },
  typeit: { key: "inner", label: "打字内容", type: "textarea" },
  rtl: { key: "inner", label: "正文", type: "textarea" },
  ltr: { key: "inner", label: "正文", type: "textarea" },
};

const decodeValue = (value: string) =>
  value.replace(/\\"/g, '"').replace(/\\\\/g, "\\");

const parseShortcode = (raw: string): ParsedShortcode => {
  const opening = raw.match(
    /^\{\{([<%])\s*([A-Za-z][\w-]*)\s*([\s\S]*?)([>%])\}\}/,
  );
  if (!opening)
    return {
      name: "shortcode",
      params: {},
      positional: [],
      inner: raw,
      marker: "<",
      paired: false,
    };

  const [, markerValue, name, parameterSource] = opening;
  const marker = markerValue as "<" | "%";
  const params: Record<string, string> = {};
  const namedPattern =
    /([A-Za-z][\w-]*)=(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|([^\s]+))/g;
  for (const match of parameterSource.matchAll(namedPattern))
    params[match[1]] = decodeValue(match[2] ?? match[3] ?? match[4] ?? "");

  const withoutNamed = parameterSource.replace(namedPattern, " ").trim();
  const positional = Array.from(
    withoutNamed.matchAll(/"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|([^\s]+)/g),
  )
    .map((match) => decodeValue(match[1] ?? match[2] ?? match[3] ?? ""))
    .filter(Boolean);
  const closingMarker = marker === "<" ? ">" : "%";
  const closingPattern = new RegExp(
    `\\{\\{${marker}\\s*\\/${name}\\s*${closingMarker}\\}\\}\\s*$`,
  );
  const paired = closingPattern.test(raw);
  const inner = paired
    ? raw.slice(opening[0].length).replace(closingPattern, "").trim()
    : raw.slice(opening[0].length).trim();
  return { name, params, positional, inner, marker, paired };
};

const encodeValue = (value: string) =>
  /^(?:true|false|-?\d+(?:\.\d+)?)$/.test(value)
    ? value
    : `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

const serializeShortcode = (parsed: ParsedShortcode): string => {
  const closingMarker = parsed.marker === "<" ? ">" : "%";
  const positional = parsed.positional
    .filter((value) => value !== "")
    .map(encodeValue);
  const named = Object.entries(parsed.params)
    .filter(([, value]) => value !== "")
    .map(([key, value]) => `${key}=${encodeValue(value)}`);
  const parameters = [...positional, ...named];
  const opening = `{{${parsed.marker} ${parsed.name}${parameters.length ? ` ${parameters.join(" ")}` : ""} ${closingMarker}}}`;
  if (!parsed.paired) return opening;
  return `${opening}\n${parsed.inner}\n{{${parsed.marker} /${parsed.name} ${closingMarker}}}`;
};

const updateParameter = (
  parsed: ParsedShortcode,
  key: string,
  value: string,
) => {
  const params = { ...parsed.params };
  if (value === "") delete params[key];
  else params[key] = value;
  return serializeShortcode({ ...parsed, params });
};

const updatePositional = (
  parsed: ParsedShortcode,
  index: number,
  value: string,
) => {
  const positional = [...parsed.positional];
  while (positional.length <= index) positional.push("");
  positional[index] = value;
  while (positional.at(-1) === "") positional.pop();
  return serializeShortcode({ ...parsed, positional });
};

const updateInner = (parsed: ParsedShortcode, inner: string) =>
  serializeShortcode({ ...parsed, inner, paired: true });

const parseNestedShortcodes = (parsed: ParsedShortcode, childName: string) => {
  const pattern = new RegExp(
    `\\{\\{([<%])\\s*${childName}\\b[\\s\\S]*?[>%]\\}\\}[\\s\\S]*?\\{\\{\\1\\s*\\/${childName}\\s*[>%]\\}\\}`,
    "g",
  );
  return Array.from(parsed.inner.matchAll(pattern)).map((match) =>
    parseShortcode(match[0]),
  );
};

const serializeNestedShortcodes = (
  parent: ParsedShortcode,
  children: ParsedShortcode[],
) =>
  serializeShortcode({
    ...parent,
    paired: true,
    inner: children.map(serializeShortcode).join("\n"),
  });

const plainText = (value: string) =>
  value
    .replace(/\{\{[<%][\s\S]*?[>%]\}\}/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
const textPreview = (value: string, fallback = "在这里填写内容") =>
  plainText(value).slice(0, 180) || fallback;
const inputClass =
  "h-9 w-full rounded-md border bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";
const textareaClass =
  "min-h-24 w-full resize-y rounded-md border bg-background p-3 text-sm leading-6 text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

const InlineField = ({
  field,
  value,
  onChange,
}: {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
}) => {
  const control = (() => {
    if (field.type === "textarea")
      return (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          className={textareaClass}
        />
      );
    if (field.type === "icon")
      return (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        >
          <option value="">不设置</option>
          {BLOWFISH_ICONS.map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </select>
      );
    if (field.type === "select")
      return (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        >
          {(field.options ?? []).map((option) => (
            <option key={`${field.key}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    if (field.type === "boolean")
      return (
        <label className="flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm">
          <input
            type="checkbox"
            checked={value === "true"}
            onChange={(event) => onChange(String(event.target.checked))}
          />
          {value === "true" ? "开启" : "关闭"}
        </label>
      );
    return (
      <div className="flex items-center gap-2">
        {field.type === "color" && /^#[0-9a-f]{6}$/i.test(value) ? (
          <span
            className="size-7 shrink-0 rounded-md border"
            style={{ backgroundColor: value }}
          />
        ) : null}
        <input
          type={field.type === "number" ? "number" : "text"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          className={inputClass}
        />
      </div>
    );
  })();
  return (
    <label
      className={field.type === "textarea" ? "block sm:col-span-2" : "block"}
    >
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        {field.label}
      </span>
      {control}
      {field.help ? (
        <span className="mt-1 block text-[11px] text-muted-foreground">
          {field.help}
        </span>
      ) : null}
    </label>
  );
};

const ParameterPills = ({ params }: { params: Record<string, string> }) => {
  const entries = Object.entries(params);
  if (!entries.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {entries.map(([key, value]) => (
        <span
          key={key}
          className="rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground"
        >
          {key}: {value}
        </span>
      ))}
    </div>
  );
};

const MediaPlaceholder = ({
  title,
  value,
  details,
}: {
  title: string;
  value?: string;
  details?: string;
}) => (
  <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed bg-muted/40">
    <div className="text-center text-muted-foreground">
      <FileImage className="mx-auto mb-2 size-7" />
      <div className="font-medium text-foreground">{title}</div>
      {value ? (
        <div className="mt-1 max-w-96 truncate text-xs">{value}</div>
      ) : null}
      {details ? <div className="mt-1 text-xs">{details}</div> : null}
    </div>
  </div>
);

const ShortcodeVisual = ({
  parsed,
}: {
  parsed: ParsedShortcode;
}): ReactNode => {
  const { name, params, positional, inner } = parsed;
  const content = textPreview(inner);
  switch (name) {
    case "alert":
      return (
        <div
          className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-100"
          style={{
            backgroundColor: params.cardColor || undefined,
            color: params.textColor || undefined,
          }}
        >
          <CircleAlert
            className="mt-0.5 size-5 shrink-0"
            style={{ color: params.iconColor || undefined }}
          />
          <div>
            <div>{content}</div>
            <div className="mt-1 text-[11px] opacity-70">
              图标：{params.icon || "triangle-exclamation"}
            </div>
          </div>
        </div>
      );
    case "lead":
      return (
        <div className="border-l-4 border-primary pl-4 text-xl font-medium leading-relaxed">
          {content}
        </div>
      );
    case "badge":
      return (
        <span className="inline-flex rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
          {content}
        </span>
      );
    case "button":
      return (
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground shadow-sm">
            {content}
          </span>
          <span className="text-xs text-muted-foreground">
            {params.pageRef || params.href || "请填写链接"}
            {params.target ? ` · ${params.target}` : ""}
          </span>
        </div>
      );
    case "icon":
      return (
        <div className="flex items-center gap-3 text-lg">
          <Sparkles className="size-6 text-primary" />
          <span>图标：{positional[0] || "请选择"}</span>
        </div>
      );
    case "figure":
    case "screenshot":
      return (
        <MediaPlaceholder
          title={params.caption || COMPONENT_LABELS[name]}
          value={params.src}
          details={params.alt}
        />
      );
    case "gallery": {
      const images = Array.from(
        inner.matchAll(/<img\s+[^>]*src=["']([^"']+)["']/g),
      ).map((match) => match[1]);
      return (
        <div className="grid grid-cols-2 gap-2">
          {(images.length ? images : ["图片一", "图片二"]).map(
            (image, index) => (
              <MediaPlaceholder
                key={`${image}-${index}`}
                title={`图片 ${index + 1}`}
                value={image}
              />
            ),
          )}
        </div>
      );
    }
    case "carousel": {
      const images = (params.images || "")
        .replace(/^\{|\}$/g, "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      return (
        <MediaPlaceholder
          title={`轮播图 · ${params.aspectRatio || "16-9"}`}
          value={images[0]}
          details={`${images.length} 张图片 · ${params.interval || "2000"}ms`}
        />
      );
    }
    case "mermaid":
      return (
        <div className="flex min-h-28 items-center justify-center rounded-lg border bg-sky-50 p-4 text-sky-900 dark:bg-sky-950/30 dark:text-sky-100">
          <Network className="mr-3 size-7" />
          <span>流程图 · {content}</span>
        </div>
      );
    case "chart": {
      const values =
        inner
          .match(/data\s*:\s*\[([^\]]+)\]/)?.[1]
          ?.split(",")
          .map((value) => Number(value.trim()))
          .filter(Number.isFinite) ?? [];
      const maximum = Math.max(...values, 1);
      return (
        <div className="flex min-h-32 items-end gap-2 rounded-lg border bg-violet-50 p-4 dark:bg-violet-950/30">
          {(values.length ? values : [4, 7, 5]).map((value, index) => (
            <div
              key={`${value}-${index}`}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <div
                className="w-full rounded-t bg-violet-500"
                style={{ height: `${Math.max(12, (value / maximum) * 80)}px` }}
              />
              <span className="text-[10px] text-violet-900 dark:text-violet-100">
                {value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    case "katex":
      return (
        <div className="rounded-lg border bg-muted/30 px-4 py-6 text-center font-serif text-xl">
          {plainText(inner) || "f(x) = x² + 2x + 1"}
        </div>
      );
    case "swatches":
      return (
        <div className="flex gap-2">
          {positional.slice(0, 3).map((color) => (
            <div
              key={color}
              className="flex h-20 min-w-24 flex-1 items-end rounded-md border p-2 text-xs"
              style={{ backgroundColor: color }}
            >
              <span className="rounded bg-background/80 px-1">{color}</span>
            </div>
          ))}
        </div>
      );
    case "github":
    case "gitlab":
    case "codeberg":
    case "gitea":
    case "forgejo":
      return (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
          <Github className="size-8" />
          <div>
            <div className="font-semibold">
              {params.repo || params.projectID || COMPONENT_LABELS[name]}
            </div>
            <div className="text-xs text-muted-foreground">
              {params.server || params.baseURL || "仓库信息将在博客中加载"}
            </div>
          </div>
        </div>
      );
    case "video":
    case "youtubeLite":
    case "youtube":
    case "vimeo_simple":
      return (
        <div className="flex aspect-video max-h-52 items-center justify-center rounded-lg border bg-neutral-950 text-white">
          <Film className="mr-3 size-8" />
          <span>
            {COMPONENT_LABELS[name]} ·{" "}
            {params.id || params.src || positional[0] || "请填写视频 ID"}
          </span>
        </div>
      );
    case "typeit":
      return (
        <div className="rounded-lg border bg-muted/30 px-4 py-5 font-mono text-lg">
          {content}
          <span className="ml-1 animate-pulse text-primary">|</span>
          <ParameterPills params={params} />
        </div>
      );
    case "rtl":
    case "ltr":
      return (
        <div
          dir={name === "rtl" ? "rtl" : "ltr"}
          className="rounded-lg border p-4"
        >
          {content}
        </div>
      );
    default:
      return (
        <div className="rounded-lg border bg-muted/25 p-4">
          <div className="font-semibold">{COMPONENT_LABELS[name] || name}</div>
          <div className="mt-1 text-sm text-muted-foreground">{content}</div>
          <ParameterPills params={params} />
        </div>
      );
  }
};

const TimelineEditor = ({
  parsed,
  onChange,
}: {
  parsed: ParsedShortcode;
  onChange: (raw: string) => void;
}) => {
  const items = parseNestedShortcodes(parsed, "timelineItem");
  const updateItem = (
    index: number,
    updater: (item: ParsedShortcode) => ParsedShortcode,
  ) =>
    onChange(
      serializeNestedShortcodes(
        parsed,
        items.map((item, itemIndex) =>
          itemIndex === index ? updater(item) : item,
        ),
      ),
    );
  const updateItemParam = (index: number, key: string, value: string) =>
    updateItem(index, (item) => {
      const params = { ...item.params };
      if (value === "") delete params[key];
      else params[key] = value;
      return { ...item, params };
    });
  const addItem = () =>
    onChange(
      serializeNestedShortcodes(parsed, [
        ...items,
        parseShortcode(
          '{{< timelineItem icon="check" header="新阶段" badge="日期" subheader="阶段说明" md=true >}}\n在这里填写内容。\n{{< /timelineItem >}}',
        ),
      ]),
    );
  return (
    <div className="space-y-3 border-l-2 border-primary/40 pl-5">
      {items.map((item, index) => (
        <div
          key={index}
          className="relative rounded-lg border bg-background p-3 before:absolute before:-left-[1.65rem] before:top-5 before:size-2 before:rounded-full before:bg-primary"
        >
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem_auto]">
            <input
              aria-label={`阶段 ${index + 1} 标题`}
              value={item.params.header ?? ""}
              onChange={(event) =>
                updateItemParam(index, "header", event.target.value)
              }
              placeholder="阶段标题"
              className={`${inputClass} font-semibold`}
            />
            <input
              aria-label={`阶段 ${index + 1} 日期`}
              value={item.params.badge ?? ""}
              onChange={(event) =>
                updateItemParam(index, "badge", event.target.value)
              }
              placeholder="日期或状态"
              className={inputClass}
            />
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={`删除阶段 ${index + 1}`}
              onClick={() =>
                onChange(
                  serializeNestedShortcodes(
                    parsed,
                    items.filter((_, itemIndex) => itemIndex !== index),
                  ),
                )
              }
            >
              <Trash2 />
            </Button>
          </div>
          <input
            aria-label={`阶段 ${index + 1} 副标题`}
            value={item.params.subheader ?? ""}
            onChange={(event) =>
              updateItemParam(index, "subheader", event.target.value)
            }
            placeholder="副标题或补充说明"
            className={`${inputClass} mt-2`}
          />
          <textarea
            aria-label={`阶段 ${index + 1} 正文`}
            value={item.inner}
            onChange={(event) =>
              updateItem(index, (current) => ({
                ...current,
                inner: event.target.value,
                paired: true,
              }))
            }
            placeholder="阶段正文"
            className={`${textareaClass} mt-2`}
          />
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <InlineField
              field={{ key: "icon", label: "图标", type: "icon" }}
              value={item.params.icon ?? ""}
              onChange={(value) => updateItemParam(index, "icon", value)}
            />
            <InlineField
              field={{
                key: "md",
                label: "按 Markdown 渲染",
                type: "select",
                options: BOOLEAN_OPTIONS,
              }}
              value={item.params.md ?? ""}
              onChange={(value) => updateItemParam(index, "md", value)}
            />
          </div>
        </div>
      ))}
      {!items.length ? (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          还没有时间线项目。
        </div>
      ) : null}
      <Button type="button" size="sm" variant="outline" onClick={addItem}>
        <Plus />
        添加阶段
      </Button>
    </div>
  );
};

const AccordionEditor = ({
  parsed,
  onChange,
}: {
  parsed: ParsedShortcode;
  onChange: (raw: string) => void;
}) => {
  const items = parseNestedShortcodes(parsed, "accordionItem");
  const commitItems = (next: ParsedShortcode[]) =>
    onChange(serializeNestedShortcodes(parsed, next));
  const updateItem = (
    index: number,
    updater: (item: ParsedShortcode) => ParsedShortcode,
  ) =>
    commitItems(
      items.map((item, itemIndex) =>
        itemIndex === index ? updater(item) : item,
      ),
    );
  const updateItemParam = (index: number, key: string, value: string) =>
    updateItem(index, (item) => {
      const params = { ...item.params };
      if (value === "") delete params[key];
      else params[key] = value;
      return { ...item, params };
    });
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <InlineField
          field={{
            key: "mode",
            label: "展开模式",
            type: "select",
            options: [
              { label: "只展开一个", value: "collapse" },
              { label: "可展开多个", value: "expand" },
            ],
          }}
          value={parsed.params.mode ?? "collapse"}
          onChange={(value) => onChange(updateParameter(parsed, "mode", value))}
        />
        <InlineField
          field={{
            key: "separated",
            label: "分离卡片",
            type: "select",
            options: BOOLEAN_OPTIONS,
          }}
          value={parsed.params.separated ?? ""}
          onChange={(value) =>
            onChange(updateParameter(parsed, "separated", value))
          }
        />
      </div>
      {items.map((item, index) => (
        <div key={index} className="rounded-lg border bg-background p-3">
          <div className="flex items-center gap-2">
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            <input
              aria-label={`折叠项 ${index + 1} 标题`}
              value={item.params.title ?? item.params.header ?? ""}
              onChange={(event) =>
                updateItemParam(index, "title", event.target.value)
              }
              placeholder="折叠标题"
              className={`${inputClass} font-semibold`}
            />
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={`删除折叠项 ${index + 1}`}
              onClick={() =>
                commitItems(items.filter((_, itemIndex) => itemIndex !== index))
              }
            >
              <Trash2 />
            </Button>
          </div>
          <textarea
            aria-label={`折叠项 ${index + 1} 正文`}
            value={item.inner}
            onChange={(event) =>
              updateItem(index, (current) => ({
                ...current,
                inner: event.target.value,
                paired: true,
              }))
            }
            className={`${textareaClass} mt-2`}
          />
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <InlineField
              field={{ key: "icon", label: "图标", type: "icon" }}
              value={item.params.icon ?? ""}
              onChange={(value) => updateItemParam(index, "icon", value)}
            />
            <InlineField
              field={{
                key: "open",
                label: "默认展开",
                type: "select",
                options: BOOLEAN_OPTIONS,
              }}
              value={item.params.open ?? ""}
              onChange={(value) => updateItemParam(index, "open", value)}
            />
            <InlineField
              field={{
                key: "align",
                label: "文字对齐",
                type: "select",
                options: [
                  { label: "默认", value: "" },
                  { label: "左", value: "left" },
                  { label: "中", value: "center" },
                  { label: "右", value: "right" },
                ],
              }}
              value={item.params.align ?? ""}
              onChange={(value) => updateItemParam(index, "align", value)}
            />
            <InlineField
              field={{
                key: "md",
                label: "Markdown",
                type: "select",
                options: BOOLEAN_OPTIONS,
              }}
              value={item.params.md ?? ""}
              onChange={(value) => updateItemParam(index, "md", value)}
            />
          </div>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() =>
          commitItems([
            ...items,
            parseShortcode(
              '{{< accordionItem title="新项目" md=true >}}\n在这里填写内容。\n{{< /accordionItem >}}',
            ),
          ])
        }
      >
        <Plus />
        添加折叠项
      </Button>
    </div>
  );
};

const TabsEditor = ({
  parsed,
  onChange,
}: {
  parsed: ParsedShortcode;
  onChange: (raw: string) => void;
}) => {
  const tabs = parseNestedShortcodes(parsed, "tab");
  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = Math.min(activeIndex, Math.max(tabs.length - 1, 0));
  const commitTabs = (next: ParsedShortcode[]) =>
    onChange(serializeNestedShortcodes(parsed, next));
  const updateTab = (
    index: number,
    updater: (tab: ParsedShortcode) => ParsedShortcode,
  ) =>
    commitTabs(
      tabs.map((tab, tabIndex) => (tabIndex === index ? updater(tab) : tab)),
    );
  const updateTabParam = (index: number, key: string, value: string) =>
    updateTab(index, (tab) => {
      const params = { ...tab.params };
      if (value === "") delete params[key];
      else params[key] = value;
      return { ...tab, params };
    });
  const activeTab = tabs[safeIndex];
  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <InlineField
          field={{ key: "group", label: "联动分组" }}
          value={parsed.params.group ?? ""}
          onChange={(value) =>
            onChange(updateParameter(parsed, "group", value))
          }
        />
        <InlineField
          field={{ key: "default", label: "默认标签" }}
          value={parsed.params.default ?? ""}
          onChange={(value) =>
            onChange(updateParameter(parsed, "default", value))
          }
        />
      </div>
      <div className="flex flex-wrap gap-1 border-b pb-2">
        {tabs.map((tab, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={
              index === safeIndex
                ? "rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground"
                : "rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
            }
          >
            {tab.params.label || `标签 ${index + 1}`}
          </button>
        ))}
        <Button
          type="button"
          size="xs"
          variant="outline"
          onClick={() => {
            commitTabs([
              ...tabs,
              parseShortcode(
                '{{< tab label="新标签" icon="check" md=true >}}\n在这里填写内容。\n{{< /tab >}}',
              ),
            ]);
            setActiveIndex(tabs.length);
          }}
        >
          <Plus />
          添加
        </Button>
      </div>
      {activeTab ? (
        <div className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <InlineField
              field={{ key: "label", label: "标签名称" }}
              value={activeTab.params.label ?? ""}
              onChange={(value) => updateTabParam(safeIndex, "label", value)}
            />
            <InlineField
              field={{ key: "icon", label: "图标", type: "icon" }}
              value={activeTab.params.icon ?? ""}
              onChange={(value) => updateTabParam(safeIndex, "icon", value)}
            />
            <div className="pt-5">
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label="删除当前标签"
                onClick={() => {
                  commitTabs(tabs.filter((_, index) => index !== safeIndex));
                  setActiveIndex(Math.max(0, safeIndex - 1));
                }}
              >
                <Trash2 />
              </Button>
            </div>
          </div>
          <textarea
            aria-label="当前标签正文"
            value={activeTab.inner}
            onChange={(event) =>
              updateTab(safeIndex, (tab) => ({
                ...tab,
                inner: event.target.value,
                paired: true,
              }))
            }
            className={textareaClass}
          />
          <InlineField
            field={{
              key: "md",
              label: "按 Markdown 渲染",
              type: "select",
              options: BOOLEAN_OPTIONS,
            }}
            value={activeTab.params.md ?? ""}
            onChange={(value) => updateTabParam(safeIndex, "md", value)}
          />
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">还没有标签页。</div>
      )}
    </div>
  );
};

const KeywordListEditor = ({
  parsed,
  onChange,
}: {
  parsed: ParsedShortcode;
  onChange: (raw: string) => void;
}) => {
  const keywords = parseNestedShortcodes(parsed, "keyword");
  const commit = (next: ParsedShortcode[]) =>
    onChange(serializeNestedShortcodes(parsed, next));
  const update = (
    index: number,
    updater: (keyword: ParsedShortcode) => ParsedShortcode,
  ) =>
    commit(
      keywords.map((keyword, keywordIndex) =>
        keywordIndex === index ? updater(keyword) : keyword,
      ),
    );
  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword, index) => (
        <div
          key={index}
          className="flex min-w-64 items-end gap-2 rounded-lg border bg-muted/25 p-2"
        >
          <InlineField
            field={{ key: "icon", label: "图标", type: "icon" }}
            value={keyword.params.icon ?? ""}
            onChange={(value) =>
              update(index, (current) => ({
                ...current,
                params: { ...current.params, icon: value },
              }))
            }
          />
          <InlineField
            field={{ key: "inner", label: "关键字" }}
            value={keyword.inner}
            onChange={(value) =>
              update(index, (current) => ({
                ...current,
                inner: value,
                paired: true,
              }))
            }
          />
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={`删除关键字 ${index + 1}`}
            onClick={() =>
              commit(
                keywords.filter((_, keywordIndex) => keywordIndex !== index),
              )
            }
          >
            <Trash2 />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() =>
          commit([
            ...keywords,
            parseShortcode(
              '{{< keyword icon="tag" >}}新关键字{{< /keyword >}}',
            ),
          ])
        }
      >
        <Plus />
        添加关键字
      </Button>
    </div>
  );
};

const GenericEditor = ({
  parsed,
  onChange,
}: {
  parsed: ParsedShortcode;
  onChange: (raw: string) => void;
}) => {
  const declaredFields = PARAMETER_FIELDS[parsed.name] ?? [];
  const declaredKeys = new Set(declaredFields.map((field) => field.key));
  const extraFields = Object.keys(parsed.params)
    .filter((key) => !declaredKeys.has(key))
    .map((key) => ({ key, label: `${key}（其他参数）` }));
  const positionalFields = POSITIONAL_FIELDS[parsed.name] ?? [];
  const bodyField = BODY_FIELDS[parsed.name];
  const hasControls =
    declaredFields.length ||
    extraFields.length ||
    positionalFields.length ||
    bodyField;
  return (
    <div className="space-y-3">
      <ShortcodeVisual parsed={parsed} />
      {hasControls ? (
        <div className="rounded-lg border bg-muted/15 p-3">
          <div className="mb-3 text-xs font-semibold text-muted-foreground">
            直接编辑组件内容和参数
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[...declaredFields, ...extraFields].map((field) => (
              <InlineField
                key={field.key}
                field={field}
                value={parsed.params[field.key] ?? ""}
                onChange={(value) =>
                  onChange(updateParameter(parsed, field.key, value))
                }
              />
            ))}
            {positionalFields.map((field, index) => (
              <InlineField
                key={`positional-${index}`}
                field={field}
                value={parsed.positional[index] ?? ""}
                onChange={(value) =>
                  onChange(updatePositional(parsed, index, value))
                }
              />
            ))}
            {bodyField ? (
              <InlineField
                field={bodyField}
                value={parsed.inner}
                onChange={(value) => onChange(updateInner(parsed, value))}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const StructuredEditor = ({
  parsed,
  onChange,
}: {
  parsed: ParsedShortcode;
  onChange: (raw: string) => void;
}) => {
  switch (parsed.name) {
    case "timeline":
      return <TimelineEditor parsed={parsed} onChange={onChange} />;
    case "accordion":
      return <AccordionEditor parsed={parsed} onChange={onChange} />;
    case "tabs":
      return <TabsEditor parsed={parsed} onChange={onChange} />;
    case "keywordList":
      return <KeywordListEditor parsed={parsed} onChange={onChange} />;
    default:
      return <GenericEditor parsed={parsed} onChange={onChange} />;
  }
};

const BlowfishShortcodePreview = ({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) => {
  const raw = String(node.attrs.raw ?? "");
  const parsed = useMemo(() => parseShortcode(raw), [raw]);
  const [showSource, setShowSource] = useState(false);
  const onChange = (nextRaw: string) => updateAttributes({ raw: nextRaw });
  return (
    <NodeViewWrapper
      contentEditable={false}
      data-blowfish-shortcode-preview="true"
      className={`my-4 overflow-hidden rounded-xl border bg-card shadow-sm ${selected ? "ring-2 ring-primary/40" : ""}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/45 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Puzzle className="size-4 shrink-0 text-primary" />
          <span className="font-medium">
            {COMPONENT_LABELS[parsed.name] || parsed.name}
          </span>
          <code className="truncate text-[11px] text-muted-foreground">
            {parsed.name}
          </code>
        </div>
        <Button
          type="button"
          size="xs"
          variant="ghost"
          onClick={() => setShowSource((value) => !value)}
        >
          {showSource ? <Eye /> : <Code2 />}
          {showSource ? "返回可视化编辑" : "编辑源码"}
        </Button>
      </div>
      <div className="p-3">
        {showSource ? (
          <div className="space-y-2">
            <textarea
              value={raw}
              onChange={(event) => onChange(event.target.value)}
              spellCheck={false}
              className="min-h-36 w-full resize-y rounded-md border bg-muted/35 p-3 font-mono text-sm leading-6 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            <div className="text-xs text-muted-foreground">
              源码与可视化表单实时使用同一份内容；最终效果以博客部署后的页面为准。
            </div>
          </div>
        ) : (
          <StructuredEditor parsed={parsed} onChange={onChange} />
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default BlowfishShortcodePreview;
export {
  BLOWFISH_ICONS,
  parseNestedShortcodes,
  parseShortcode,
  serializeNestedShortcodes,
  serializeShortcode,
  updateInner,
  updateParameter,
  updatePositional,
};
