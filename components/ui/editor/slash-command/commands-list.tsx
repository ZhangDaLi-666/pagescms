import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Editor } from "@tiptap/core";
import type { LucideIcon } from "lucide-react";
import { Ban } from "lucide-react";

export type SlashItem = {
  id: string;
  title: string;
  description?: string;
  group: "基础格式" | "Blowfish 组件";
  searchTerms?: string[];
  tableSafe?: boolean;
  icon: LucideIcon;
  command: (params: { editor: Editor; range: { from: number; to: number } }) => void;
};

type CommandsListProps = {
  items: SlashItem[];
  command: (item: SlashItem) => void;
};

export type CommandsListHandle = {
  onKeyDown: (event: KeyboardEvent) => boolean;
};

const CommandsList = forwardRef<CommandsListHandle, CommandsListProps>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useEffect(() => {
    selectedItemRef.current?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const selectItem = (index: number) => {
    const item = items[index];
    if (item) command(item);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: (event: KeyboardEvent) => {
      if (!items.length) return false;

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((current) => (current + items.length - 1) % items.length);
        return true;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((current) => (current + 1) % items.length);
        return true;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="bg-popover text-popover-foreground border-border z-50 max-h-[min(28rem,65vh)] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-md border p-1 shadow-md">
      {items.length ? (
        items.map((item, index) => {
          const previousGroup = index > 0 ? items[index - 1]?.group : null;
          const showGroup = index === 0 || previousGroup !== item.group;

          return (
            <div key={item.id}>
              {showGroup ? (
                <div className="text-muted-foreground px-2 pb-1 pt-2 text-xs font-medium first:pt-1">
                  {item.group}
                  {item.group === "Blowfish 组件" ? " · 插入后可预览和编辑" : ""}
                </div>
              ) : null}
              <button
                ref={selectedIndex === index ? selectedItemRef : undefined}
                type="button"
                onClick={() => selectItem(index)}
                data-selected={selectedIndex === index ? "true" : undefined}
                className="focus:bg-accent focus:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground relative flex w-full cursor-default items-start rounded-sm px-2 py-2 text-left text-sm outline-none"
              >
                <item.icon className="mr-2 mt-0.5 size-4 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="font-medium">{item.title}</span>
                    {item.group === "Blowfish 组件" ? (
                      <code className="text-muted-foreground truncate text-[11px]">{item.id}</code>
                    ) : null}
                  </span>
                  {item.description ? (
                    <span className="text-muted-foreground mt-0.5 block text-xs leading-snug">
                      {item.description}
                    </span>
                  ) : null}
                </span>
              </button>
            </div>
          );
        })
      ) : (
        <div className="text-muted-foreground flex items-center px-2 py-1.5 text-sm">
          <Ban className="mr-2 size-4" />
          没有匹配的组件
        </div>
      )}
    </div>
  );
});

CommandsList.displayName = "CommandsList";

export default CommandsList;
