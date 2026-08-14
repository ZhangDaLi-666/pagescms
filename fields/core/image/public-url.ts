import type { Field } from "@/types/field";

const getPublicUrl = (field: Field): string | null => {
  const value = field.options?.publicUrl;
  if (typeof value !== "string" || !value.trim()) return null;
  return value.trim().replace(/\/$/, "");
};

const stripPublicUrl = (value: string, publicUrl: string | null): string => {
  if (!publicUrl) return value;
  if (value === publicUrl) return "/";
  return value.startsWith(`${publicUrl}/`)
    ? value.slice(publicUrl.length)
    : value;
};

const prependPublicUrl = (value: string, publicUrl: string | null): string => {
  if (
    !publicUrl ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("//")
  ) {
    return value;
  }

  return `${publicUrl}/${value.replace(/^\/+/, "")}`;
};

export { getPublicUrl, prependPublicUrl, stripPublicUrl };
