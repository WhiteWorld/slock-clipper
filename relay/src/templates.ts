import type { NormalizedSharePayload } from "../../shared/dist/schema.js";

type ContentCategory = "selection" | "github" | "article" | "default";

export function renderShareMessage(payload: NormalizedSharePayload, defaultMention?: string): string {
  const lines: string[] = [];
  const label = labelFor(payload.type);
  const mention = payload.mention ?? defaultMention;
  const category = detectContentCategory(payload);

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
    const prompt = generatePrompt(category, payload);
    lines.push(`${mention} ${prompt}`);
  }

  return lines.join("\n").trimEnd() + "\n";
}

function detectContentCategory(payload: NormalizedSharePayload): ContentCategory {
  // Selection always gets its own treatment
  if (payload.type === "selection" || payload.selection) {
    return "selection";
  }

  const url = payload.url ?? "";
  const lowerUrl = url.toLowerCase();

  // GitHub repos, issues, PRs
  if (
    lowerUrl.includes("github.com/") &&
    !lowerUrl.includes("/search") &&
    !lowerUrl.includes("/topics") &&
    !lowerUrl.includes("/marketplace")
  ) {
    return "github";
  }

  // Technical article / blog sites
  if (
    lowerUrl.includes("medium.com") ||
    lowerUrl.includes("zhihu.com") ||
    lowerUrl.match(/mp\.weixin\.qq\.com/) ||
    lowerUrl.includes("sspai.com") ||
    lowerUrl.includes("ruanyifeng.com") ||
    lowerUrl.includes("blog.") ||
    lowerUrl.match(/\/(blog|post|article|posts)\//)
  ) {
    return "article";
  }

  // arXiv papers
  if (lowerUrl.includes("arxiv.org")) {
    return "article";
  }

  // RSS / podcast
  if (lowerUrl.includes("podcasts.apple.com") || lowerUrl.includes("xiaoyuzhoufm.com")) {
    return "article";
  }

  return "default";
}

function generatePrompt(category: ContentCategory, payload: NormalizedSharePayload): string {
  switch (category) {
    case "selection":
      return "请仅根据上面的摘录文字进行总结，提炼核心观点。不需要访问链接获取更多内容。";

    case "github": {
      const isRepo = payload.url?.match(/github\.com\/[^/]+\/[^/]+$/);
      if (isRepo) {
        return "请分析这个 GitHub 项目，从以下角度总结：\n- 功能定位与技术栈\n- 核心架构与设计亮点\n- 是否值得深入关注";
      }
      return "请分析这个 GitHub 链接的内容，总结关键信息。";
    }

    case "article":
      return "请阅读并总结这篇文章：\n- 核心观点（3-5 条）\n- 作者立场和方法论\n- 可迁移的实践或启发";

    case "default":
    default:
      return "请阅读并总结这篇内容，提炼 3-5 个要点。";
  }
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
