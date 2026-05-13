export type ShareType = "page" | "selection" | "note" | "code";

export interface SharePayload {
  type?: ShareType;
  title?: string;
  url?: string;
  selection?: string;
  text?: string;
  note?: string;
  target?: string;
  mention?: string;
  source?: string;
}

export interface NormalizedSharePayload {
  type: ShareType;
  title?: string;
  url?: string;
  selection?: string;
  text?: string;
  note?: string;
  target?: string;
  mention?: string;
  source: string;
}

export function normalizeSharePayload(input: unknown): NormalizedSharePayload {
  if (!input || typeof input !== "object") {
    throw new Error("Request body must be a JSON object");
  }

  const payload = input as SharePayload;
  const type = parseType(payload.type);
  const title = cleanOptionalString(payload.title, 300);
  const url = cleanOptionalString(payload.url, 2048);
  const selection = cleanOptionalString(payload.selection, 8000);
  const text = cleanOptionalString(payload.text, 8000);
  const note = cleanOptionalString(payload.note, 4000);
  const target = cleanOptionalString(payload.target, 120);
  const mention = cleanOptionalString(payload.mention, 120);
  const source = cleanOptionalString(payload.source, 80) ?? "chrome-extension";

  if (!title && !url && !selection && !text && !note) {
    throw new Error("At least one of title, url, selection, text, or note is required");
  }

  if (target && !isValidTarget(target)) {
    throw new Error("target must look like a Slock channel, thread, or DM target");
  }

  if (mention && !/^@[A-Za-z0-9_.-]+$/.test(mention)) {
    throw new Error("mention must look like @agentName");
  }

  return { type, title, url, selection, text, note, target, mention, source };
}

function parseType(value: unknown): ShareType {
  if (value === undefined || value === null || value === "") {
    return "page";
  }
  if (value === "page" || value === "selection" || value === "note" || value === "code") {
    return value;
  }
  throw new Error("type must be one of page, selection, note, or code");
}

function cleanOptionalString(value: unknown, maxLength: number): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new Error("Payload fields must be strings");
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.slice(0, maxLength);
}

function isValidTarget(target: string): boolean {
  return target.startsWith("#") || target.startsWith("dm:@");
}
