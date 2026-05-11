import type { NormalizedSharePayload } from "../../shared/dist/schema.js";

export function renderShareMessage(payload: NormalizedSharePayload, defaultMention?: string): string {
  const lines: string[] = [];
  const label = labelFor(payload.type);
  const mention = payload.mention ?? defaultMention;

  lines.push(`${label}`);

  if (payload.title) {
    lines.push(`标题：${payload.title}`);
  }
  if (payload.url) {
    lines.push(`链接：${payload.url}`);
  }
  lines.push("");

  if (payload.selection) {
    lines.push("摘录：");
    lines.push(blockquote(payload.selection));
    lines.push("");
  }

  if (payload.note) {
    lines.push("备注：");
    lines.push(payload.note);
    lines.push("");
  }

  lines.push(`来源：${payload.source}`);

  if (mention) {
    lines.push("");
    lines.push(`${mention} 请总结这篇内容，并提炼 3-5 个要点。`);
  }

  return lines.join("\n").trimEnd() + "\n";
}

function labelFor(type: NormalizedSharePayload["type"]): string {
  switch (type) {
    case "selection":
      return "📌 网页摘录";
    case "note":
      return "📌 快速笔记";
    case "code":
      return "📌 代码片段";
    case "page":
    default:
      return "📌 网页收藏";
  }
}

function blockquote(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => `> ${line}`)
    .join("\n");
}
