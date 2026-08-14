"use client";

import { useMemo, useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { CircleAlert, Code2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BLOWFISH_ICONS } from "./blowfish-shortcode-preview";

type ParsedAdmonition = {
  type: string;
  sign: "" | "+" | "-";
  title: string;
  icon: string;
  body: string;
};

const ADMONITION_TYPES = [
  "NOTE",
  "TIP",
  "IMPORTANT",
  "WARNING",
  "CAUTION",
  "ABSTRACT",
  "INFO",
  "TODO",
  "SUCCESS",
  "QUESTION",
  "FAILURE",
  "DANGER",
  "BUG",
  "EXAMPLE",
  "QUOTE",
] as const;

const DEFAULT_TITLES: Record<string, string> = {
  NOTE: "注意",
  TIP: "提示",
  IMPORTANT: "重要",
  WARNING: "警告",
  CAUTION: "小心",
  ABSTRACT: "摘要",
  INFO: "信息",
  TODO: "待办",
  SUCCESS: "成功",
  QUESTION: "问题",
  FAILURE: "失败",
  DANGER: "危险",
  BUG: "错误",
  EXAMPLE: "示例",
  QUOTE: "引用",
};

const TYPE_STYLES: Record<string, string> = {
  NOTE: "border-blue-500 bg-blue-50 text-blue-950 dark:bg-blue-950/35 dark:text-blue-100",
  TIP: "border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/35 dark:text-emerald-100",
  IMPORTANT:
    "border-violet-500 bg-violet-50 text-violet-950 dark:bg-violet-950/35 dark:text-violet-100",
  WARNING:
    "border-amber-500 bg-amber-50 text-amber-950 dark:bg-amber-950/35 dark:text-amber-100",
  CAUTION:
    "border-red-500 bg-red-50 text-red-950 dark:bg-red-950/35 dark:text-red-100",
  DANGER:
    "border-red-500 bg-red-50 text-red-950 dark:bg-red-950/35 dark:text-red-100",
  SUCCESS:
    "border-green-500 bg-green-50 text-green-950 dark:bg-green-950/35 dark:text-green-100",
  FAILURE:
    "border-rose-500 bg-rose-50 text-rose-950 dark:bg-rose-950/35 dark:text-rose-100",
  BUG: "border-rose-500 bg-rose-50 text-rose-950 dark:bg-rose-950/35 dark:text-rose-100",
  QUESTION:
    "border-cyan-500 bg-cyan-50 text-cyan-950 dark:bg-cyan-950/35 dark:text-cyan-100",
};

const inputClass =
  "h-9 w-full rounded-md border bg-background/90 px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";
const textareaClass =
  "min-h-24 w-full resize-y rounded-md border bg-background/90 p-3 text-sm leading-6 text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

const parseAdmonition = (raw: string): ParsedAdmonition => {
  const lines = raw.trimEnd().split(/\r?\n/);
  const firstLine = lines[0]?.match(/^>\s*\[!([A-Za-z]+)\]([+-]?)\s*(.*)$/);
  if (!firstLine)
    return { type: "TIP", sign: "", title: "", icon: "", body: raw };

  let icon = "";
  const lastLine = lines.at(-1)?.match(/^\{icon=(?:"([^"]*)"|'([^']*)')\}\s*$/);
  if (lastLine) {
    icon = lastLine[1] ?? lastLine[2] ?? "";
    lines.pop();
  }

  const body = lines
    .slice(1)
    .map((line) => line.replace(/^> ?/, ""))
    .join("\n")
    .trimEnd();

  return {
    type: firstLine[1].toUpperCase(),
    sign: (firstLine[2] || "") as ParsedAdmonition["sign"],
    title: firstLine[3]?.trim() ?? "",
    icon,
    body,
  };
};

const serializeAdmonition = ({
  type,
  sign,
  title,
  icon,
  body,
}: ParsedAdmonition) => {
  const firstLine = `> [!${type.toUpperCase()}]${sign}${title ? ` ${title}` : ""}`;
  const bodyLines = body
    ? body.split("\n").map((line) => (line ? `> ${line}` : ">"))
    : [];
  const iconLine = icon ? [`{icon="${icon.replace(/"/g, "")}"}`] : [];
  return [firstLine, ...bodyLines, ...iconLine].join("\n");
};

const BlowfishAdmonitionPreview = ({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) => {
  const raw = String(node.attrs.raw ?? "");
  const parsed = useMemo(() => parseAdmonition(raw), [raw]);
  const [showSource, setShowSource] = useState(false);
  const update = (changes: Partial<ParsedAdmonition>) =>
    updateAttributes({ raw: serializeAdmonition({ ...parsed, ...changes }) });
  const typeOptions = ADMONITION_TYPES.includes(
    parsed.type as (typeof ADMONITION_TYPES)[number],
  )
    ? ADMONITION_TYPES
    : ([parsed.type, ...ADMONITION_TYPES] as readonly string[]);

  return (
    <NodeViewWrapper
      contentEditable={false}
      data-blowfish-admonition-preview="true"
      className={`my-4 overflow-hidden rounded-xl border bg-card shadow-sm ${selected ? "ring-2 ring-primary/40" : ""}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/45 px-3 py-2">
        <div className="flex items-center gap-2">
          <CircleAlert className="size-4 text-primary" />
          <span className="font-medium">提示框</span>
          <code className="text-[11px] text-muted-foreground">admonition</code>
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
              onChange={(event) =>
                updateAttributes({ raw: event.target.value })
              }
              spellCheck={false}
              className="min-h-32 w-full resize-y rounded-md border bg-muted/35 p-3 font-mono text-sm leading-6 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            <div className="text-xs text-muted-foreground">
              使用 Blowfish / GitHub Alert Markdown 语法。
            </div>
          </div>
        ) : (
          <div
            className={`rounded-lg border-l-4 p-4 ${TYPE_STYLES[parsed.type] ?? TYPE_STYLES.NOTE}`}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <label>
                <span className="mb-1 block text-xs font-medium opacity-75">
                  类型
                </span>
                <select
                  value={parsed.type}
                  onChange={(event) => update({ type: event.target.value })}
                  className={inputClass}
                >
                  {typeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium opacity-75">
                  折叠方式
                </span>
                <select
                  value={parsed.sign}
                  onChange={(event) =>
                    update({
                      sign: event.target.value as ParsedAdmonition["sign"],
                    })
                  }
                  className={inputClass}
                >
                  <option value="">不折叠</option>
                  <option value="+">默认展开，可折叠</option>
                  <option value="-">默认收起，可展开</option>
                </select>
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium opacity-75">
                  图标
                </span>
                <select
                  value={parsed.icon}
                  onChange={(event) => update({ icon: event.target.value })}
                  className={inputClass}
                >
                  <option value="">跟随类型</option>
                  {BLOWFISH_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-medium opacity-75">
                标题
              </span>
              <input
                aria-label="提示框标题"
                value={parsed.title}
                onChange={(event) => update({ title: event.target.value })}
                placeholder={DEFAULT_TITLES[parsed.type] ?? parsed.type}
                className={`${inputClass} font-semibold`}
              />
            </label>
            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-medium opacity-75">
                内容
              </span>
              <textarea
                aria-label="提示框内容"
                value={parsed.body}
                onChange={(event) => update({ body: event.target.value })}
                placeholder="在这里填写提示内容，支持 Markdown。"
                className={textareaClass}
              />
            </label>
            <div className="mt-2 text-[11px] opacity-65">
              {parsed.icon
                ? `自定义图标：${parsed.icon}`
                : `默认图标由 ${parsed.type} 类型决定`}
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default BlowfishAdmonitionPreview;
export { ADMONITION_TYPES, parseAdmonition, serializeAdmonition };
