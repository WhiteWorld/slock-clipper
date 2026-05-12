import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { NormalizedSharePayload } from "../../shared/dist/schema.js";

// ---- Config ----

interface TemplateDef {
  label: string;
  prompt: string;
  promptRepo?: string;
}

interface TemplatesConfig {
  selection: TemplateDef;
  github: TemplateDef;
  article: TemplateDef;
  note: TemplateDef;
  code: TemplateDef;
  default: TemplateDef;
}

const EN_DEFAULTS: TemplatesConfig = {
  selection: {
    label: "📌 Selected Text",
    prompt:
      "Please summarize the selected text above. Extract only the core points without accessing the linked page.",
  },
  github: {
    label: "📌 GitHub",
    promptRepo:
      "Please analyze this GitHub repository:\n- Purpose and tech stack\n- Architecture and design highlights\n- Whether it's worth following",
    prompt: "Please analyze this GitHub link and summarize the key information.",
  },
  article: {
    label: "📌 Article",
    prompt:
      "Please read and summarize this article:\n- Core points (3-5)\n- Author's position and methodology\n- Actionable insights or takeaways",
  },
  note: {
    label: "📌 Quick Note",
    prompt: "Please organize the key points from the note above.",
  },
  code: {
    label: "📌 Code Snippet",
    prompt: "Please analyze the functionality and design of this code.",
  },
  default: {
    label: "📌 Webpage",
    prompt: "Please read and summarize this content. Extract 3-5 key points.",
  },
};

let _cached: TemplatesConfig | null = null;

function loadTemplates(): TemplatesConfig {
  if (_cached) return _cached;
  try {
    const raw = readFileSync(resolve("relay/templates.json"), "utf8");
    // Resolve path relative to project root (where relay is invoked)
    const user = JSON.parse(raw) as Partial<TemplatesConfig>;
    _cached = { ...EN_DEFAULTS, ...user };
  } catch {
    _cached = EN_DEFAULTS;
  }
  return _cached;
}

// ---- Content detection ----

type ContentCategory = keyof TemplatesConfig;

function detectContentCategory(payload: NormalizedSharePayload): ContentCategory {
  if (payload.type === "selection" || payload.selection) return "selection";
  if (payload.type === "note") return "note";
  if (payload.type === "code") return "code";

  const url = (payload.url ?? "").toLowerCase();

  if (
    url.includes("github.com/") &&
    !url.includes("/search") &&
    !url.includes("/topics") &&
    !url.includes("/marketplace")
  ) {
    return "github";
  }

  if (
    url.includes("medium.com") ||
    url.includes("zhihu.com") ||
    /mp\.weixin\.qq\.com/.test(url) ||
    url.includes("sspai.com") ||
    url.includes("ruanyifeng.com") ||
    url.includes("blog.") ||
    /\/(blog|post|article|posts)\//.test(url) ||
    url.includes("arxiv.org") ||
    url.includes("podcasts.apple.com") ||
    url.includes("xiaoyuzhoufm.com")
  ) {
    return "article";
  }

  return "default";
}

// ---- Render ----

export function renderShareMessage(
  payload: NormalizedSharePayload,
  defaultMention?: string,
): string {
  const tpl = loadTemplates();
  const category = detectContentCategory(payload);
  const def = tpl[category];
  const mention = payload.mention ?? defaultMention;

  const lines: string[] = [def.label];

  if (payload.title) lines.push(`标题：${payload.title}`);
  if (payload.url) lines.push(`链接：${payload.url}`);
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
    const isRepo =
      category === "github" &&
      payload.url?.match(/github\.com\/[^/]+\/[^/]+$/);
    const prompt = isRepo && def.promptRepo ? def.promptRepo : def.prompt;
    lines.push("");
    lines.push(`${mention} ${prompt}`);
  }

  return lines.join("\n").trimEnd() + "\n";
}

function blockquote(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => `> ${line}`)
    .join("\n");
}
