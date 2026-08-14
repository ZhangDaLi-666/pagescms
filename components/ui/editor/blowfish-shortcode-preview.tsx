"use client";

import { useMemo, useState, type ReactNode } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import {
  ChartNoAxesCombined,
  ChevronDown,
  CircleAlert,
  Code2,
  Eye,
  FileImage,
  Film,
  Github,
  Network,
  Puzzle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const BLOWFISH_ICONS = [
  "a11y", "amazon", "ansible", "apple", "bars", "bell", "blogger", "bluesky",
  "bomb", "bug", "check", "chevron-down", "circle-info", "circle-question", "cloud",
  "cloud-moon", "code", "codeberg", "codepen", "comment", "dev", "discord", "discourse",
  "docker", "download", "dribbble", "edit", "email", "envelope", "expand", "eye",
  "facebook", "fediverse", "file-lines", "fire", "flickr", "forgejo", "fork", "foursquare",
  "ghost", "gitea", "github", "gitlab", "globe", "goodreads", "google", "google-scholar",
  "graduation-cap", "hackernews", "hashnode", "heart", "heart-empty", "image", "instagram",
  "itch-io", "keybase", "keyoxide", "kickstarter", "ko-fi", "language", "lastfm", "lightbulb",
  "line", "link", "linkedin", "list", "list-check", "list-ol", "location-dot", "lock",
  "mastodon", "matrix", "medium", "microsoft", "moon", "mug-hot", "music", "orcid",
  "patreon", "paypal", "peertube", "pencil", "pgpkey", "phone", "pinterest", "pixelfed",
  "poo", "printables", "quote-left", "reddit", "researchgate", "rss", "rss-square",
  "scale-balanced", "search", "shield", "signal", "skull-crossbones", "slack", "snapchat",
  "soundcloud", "spotify", "stack-overflow", "star", "steam", "strava", "stripe", "substack",
  "sun", "tag", "telegram", "threads", "tiktok", "triangle-exclamation", "tumblr", "twitch",
  "twitter", "untappd", "wand-magic-sparkles", "whatsapp", "worktree", "xing", "xmark",
  "x-twitter", "youtube",
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
};

const parseShortcode = (raw: string): ParsedShortcode => {
  const opening = raw.match(/^\{\{([<%])\s*([A-Za-z][\w-]*)\s*([\s\S]*?)([>%])\}\}/);
  if (!opening) return { name: "shortcode", params: {}, positional: [], inner: raw };

  const [, marker, name, parameterSource] = opening;
  const params: Record<string, string> = {};
  const namedPattern = /([A-Za-z][\w-]*)=(?:"([^"]*)"|'([^']*)'|([^\s]+))/g;
  for (const match of parameterSource.matchAll(namedPattern)) {
    params[match[1]] = match[2] ?? match[3] ?? match[4] ?? "";
  }

  const withoutNamed = parameterSource.replace(namedPattern, " ").trim();
  const positional = Array.from(withoutNamed.matchAll(/"([^"]*)"|'([^']*)'|([^\s]+)/g))
    .map((match) => match[1] ?? match[2] ?? match[3] ?? "")
    .filter(Boolean);
  const closingMarker = marker === "<" ? ">" : "%";
  const closingPattern = new RegExp(
    `\\{\\{${marker}\\s*\\/${name}\\s*${closingMarker}\\}\\}\\s*$`,
  );
  const inner = raw.slice(opening[0].length).replace(closingPattern, "").trim();

  return { name, params, positional, inner };
};

const plainText = (value: string) =>
  value
    .replace(/\{\{[<%][\s\S]*?[>%]\}\}/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const textPreview = (value: string, fallback = "在这里填写内容") => {
  const text = plainText(value);
  return text ? text.slice(0, 180) : fallback;
};

const getMatches = (raw: string, pattern: RegExp) =>
  Array.from(raw.matchAll(pattern)).map((match) => match[1]).filter(Boolean);

const replaceIcon = (raw: string, name: string, icon: string) => {
  if (name === "icon") {
    return raw.replace(
      /^(\{\{[<%]\s*icon\s+)(?:"[^"]*"|'[^']*'|[^\s>%]+)(\s*[>%]\}\})/,
      `$1"${icon}"$2`,
    );
  }

  if (/\bicon=(?:"[^"]*"|'[^']*'|[^\s>%]+)/.test(raw)) {
    return raw.replace(
      /\bicon=(?:"[^"]*"|'[^']*'|[^\s>%]+)/,
      `icon="${icon}"`,
    );
  }

  return raw.replace(/^(\{\{[<%]\s*[A-Za-z][\w-]*)(\s*[>%]\}\})/, `$1 icon="${icon}"$2`);
};

const ParameterPills = ({ params }: { params: Record<string, string> }) => {
  const entries = Object.entries(params);
  if (!entries.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {entries.slice(0, 6).map(([key, value]) => (
        <span key={key} className="rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
          {key}: {value}
        </span>
      ))}
    </div>
  );
};

const MediaPlaceholder = ({ title, value }: { title: string; value?: string }) => (
  <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed bg-muted/40">
    <div className="text-center text-muted-foreground">
      <FileImage className="mx-auto mb-2 size-7" />
      <div className="font-medium text-foreground">{title}</div>
      {value ? <div className="mt-1 max-w-80 truncate text-xs">{value}</div> : null}
    </div>
  </div>
);

const ShortcodeVisual = ({ parsed, raw }: { parsed: ParsedShortcode; raw: string }): ReactNode => {
  const { name, params, positional, inner } = parsed;
  const content = textPreview(inner);

  switch (name) {
    case "alert":
      return (
        <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-100">
          <CircleAlert className="mt-0.5 size-5 shrink-0" />
          <div>{content}</div>
        </div>
      );
    case "lead":
      return <div className="border-l-4 border-primary pl-4 text-xl font-medium leading-relaxed">{content}</div>;
    case "badge":
      return <span className="inline-flex rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">{content}</span>;
    case "button":
      return (
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground shadow-sm">{content}</span>
          <span className="text-xs text-muted-foreground">{params.href || "请填写链接"}</span>
        </div>
      );
    case "accordion": {
      const titles = getMatches(raw, /accordionItem\s+[^}]*title="([^"]+)"/g);
      return (
        <div className="divide-y rounded-lg border">
          {(titles.length ? titles : ["折叠项目"]).map((title) => (
            <div key={title} className="flex items-center justify-between px-4 py-3 font-medium">
              {title}<ChevronDown className="size-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      );
    }
    case "tabs": {
      const labels = getMatches(raw, /\btab\s+[^}]*label="([^"]+)"/g);
      return (
        <div className="rounded-lg border p-3">
          <div className="flex gap-2 border-b pb-2">
            {(labels.length ? labels : ["标签页"]).map((label, index) => (
              <span key={label} className={index === 0 ? "rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground" : "px-3 py-1 text-xs text-muted-foreground"}>{label}</span>
            ))}
          </div>
          <div className="pt-3 text-sm text-muted-foreground">{content}</div>
        </div>
      );
    }
    case "timeline": {
      const headers = getMatches(raw, /timelineItem\s+[^}]*header="([^"]+)"/g);
      return (
        <div className="space-y-3 border-l-2 border-primary/40 pl-5">
          {(headers.length ? headers : ["时间线项目"]).map((header) => (
            <div key={header} className="relative rounded-md border bg-background px-3 py-2 text-sm font-medium before:absolute before:-left-[1.65rem] before:top-3 before:size-2 before:rounded-full before:bg-primary">{header}</div>
          ))}
        </div>
      );
    }
    case "keywordList": {
      const keywords = getMatches(raw, /\}\}([^{}]+)\{\{<\s*\/keyword/g);
      return <div className="flex flex-wrap gap-2">{(keywords.length ? keywords : ["关键词"]).map((item) => <span key={item} className="rounded-md border bg-muted px-3 py-1 text-sm">{item.trim()}</span>)}</div>;
    }
    case "icon":
      return <div className="flex items-center gap-3 text-lg"><Sparkles className="size-6 text-primary" /><span>图标：{positional[0] || "请选择"}</span></div>;
    case "figure":
    case "screenshot":
      return <MediaPlaceholder title={params.caption || COMPONENT_LABELS[name]} value={params.src} />;
    case "gallery":
    case "carousel":
      return (
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((item) => <div key={item} className="flex aspect-video items-center justify-center rounded-md border bg-muted/40"><FileImage className="size-6 text-muted-foreground" /></div>)}
        </div>
      );
    case "mermaid":
      return <div className="flex min-h-28 items-center justify-center rounded-lg border bg-sky-50 text-sky-900 dark:bg-sky-950/30 dark:text-sky-100"><Network className="mr-3 size-7" /><span>流程图预览 · {content}</span></div>;
    case "chart":
      return <div className="flex min-h-28 items-center justify-center rounded-lg border bg-violet-50 text-violet-900 dark:bg-violet-950/30 dark:text-violet-100"><ChartNoAxesCombined className="mr-3 size-7" /><span>数据图表 · 保存后由 Chart.js 渲染</span></div>;
    case "katex":
      return <div className="rounded-lg border bg-muted/30 px-4 py-6 text-center font-serif text-xl">{plainText(inner) || "f(x) = x² + 2x + 1"}</div>;
    case "swatches":
      return <div className="flex gap-2">{positional.slice(0, 3).map((color) => <div key={color} className="flex h-20 min-w-24 flex-1 items-end rounded-md border p-2 text-xs" style={{ backgroundColor: color }}><span className="rounded bg-background/80 px-1">{color}</span></div>)}</div>;
    case "github":
    case "gitlab":
    case "codeberg":
    case "gitea":
    case "forgejo":
      return <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4"><Github className="size-8" /><div><div className="font-semibold">{params.repo || params.projectID || COMPONENT_LABELS[name]}</div><div className="text-xs text-muted-foreground">仓库信息卡片将在博客中加载</div></div></div>;
    case "video":
    case "youtubeLite":
    case "youtube":
    case "vimeo_simple":
      return <div className="flex aspect-video max-h-52 items-center justify-center rounded-lg border bg-neutral-950 text-white"><Film className="mr-3 size-8" /><span>{COMPONENT_LABELS[name]} · {params.id || params.src || positional[0] || "请填写视频 ID"}</span></div>;
    case "typeit":
      return <div className="rounded-lg border bg-muted/30 px-4 py-5 font-mono text-lg">{content}<span className="ml-1 animate-pulse text-primary">|</span></div>;
    case "article":
    case "list":
    case "gist":
    case "huggingface":
    case "ansible":
    case "codeimporter":
    case "mdimporter":
    case "twitter_simple":
    case "email":
      return <div className="rounded-lg border bg-muted/25 p-4"><div className="font-semibold">{COMPONENT_LABELS[name]}</div><div className="mt-1 text-sm text-muted-foreground">{content}</div><ParameterPills params={params} /></div>;
    case "rtl":
    case "ltr":
      return <div dir={name === "rtl" ? "rtl" : "ltr"} className="rounded-lg border p-4">{content}</div>;
    default:
      return <div className="rounded-lg border bg-muted/25 p-4 text-sm text-muted-foreground">{content}</div>;
  }
};

const BlowfishShortcodePreview = ({ node, updateAttributes, selected }: NodeViewProps) => {
  const raw = String(node.attrs.raw ?? "");
  const parsed = useMemo(() => parseShortcode(raw), [raw]);
  const [showSource, setShowSource] = useState(false);
  const currentIcon = parsed.name === "icon"
    ? parsed.positional[0]
    : parsed.params.icon;
  const showIconPicker = parsed.name === "icon" || parsed.name === "alert";

  return (
    <NodeViewWrapper
      contentEditable={false}
      data-blowfish-shortcode-preview="true"
      className={`my-4 overflow-hidden rounded-xl border bg-card shadow-sm ${selected ? "ring-2 ring-primary/40" : ""}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/45 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Puzzle className="size-4 shrink-0 text-primary" />
          <span className="font-medium">{COMPONENT_LABELS[parsed.name] || parsed.name}</span>
          <code className="truncate text-[11px] text-muted-foreground">{parsed.name}</code>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {showIconPicker ? (
            <label className="flex items-center gap-1 text-xs text-muted-foreground">
              图标
              <select
                value={currentIcon || "circle-info"}
                onChange={(event) => updateAttributes({ raw: replaceIcon(raw, parsed.name, event.target.value) })}
                className="h-7 max-w-40 rounded-md border bg-background px-2 text-xs text-foreground"
              >
                {BLOWFISH_ICONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
              </select>
            </label>
          ) : null}
          <Button type="button" size="xs" variant="ghost" onClick={() => setShowSource((value) => !value)}>
            {showSource ? <Eye /> : <Code2 />}
            {showSource ? "查看预览" : "编辑源码"}
          </Button>
        </div>
      </div>

      <div className="p-3">
        {showSource ? (
          <div className="space-y-2">
            <textarea
              value={raw}
              onChange={(event) => updateAttributes({ raw: event.target.value })}
              spellCheck={false}
              className="min-h-36 w-full resize-y rounded-md border bg-muted/35 p-3 font-mono text-sm leading-6 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            <div className="text-xs text-muted-foreground">
              复杂参数可在这里修改；最终效果以博客完成部署后的页面为准。
            </div>
          </div>
        ) : (
          <ShortcodeVisual parsed={parsed} raw={raw} />
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default BlowfishShortcodePreview;
export { BLOWFISH_ICONS, parseShortcode, replaceIcon };
