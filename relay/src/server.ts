import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { normalizeSharePayload } from "../../shared/dist/schema.js";
import { loadConfig } from "./config.js";
import { sendSlockMessage } from "./slock-cli.js";
import { renderShareMessage } from "./templates.js";

const config = loadConfig();

const server = createServer(async (req, res) => {
  try {
    setCorsHeaders(res);

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === "GET" && req.url === "/health") {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method !== "POST" || req.url !== "/share") {
      sendJson(res, 404, { ok: false, error: "Not found" });
      return;
    }

    assertSecret(req);
    const body = await readJson(req);
    const payload = normalizeSharePayload(body);
    const target = payload.target ?? config.defaultTarget;
    const message = renderShareMessage(payload, config.defaultMention);
    const result = await sendSlockMessage(config, target, message);

    if (!result.ok) {
      sendJson(res, 502, { ok: false, error: "slock CLI failed", detail: result.stderr || result.stdout });
      return;
    }

    sendJson(res, 200, { ok: true, target, messageId: result.messageId, output: result.stdout });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    sendJson(res, 400, { ok: false, error: message });
  }
});

server.listen(config.port, config.host, () => {
  console.log(`Slock Clipper relay listening on http://${config.host}:${config.port}`);
});

function assertSecret(req: IncomingMessage): void {
  const provided = req.headers["x-slock-clipper-secret"];
  if (provided !== config.relaySecret) {
    throw new Error("Invalid relay secret");
  }
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > 64 * 1024) {
      throw new Error("Request body too large");
    }
    chunks.push(buffer);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

function setCorsHeaders(res: ServerResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type,x-slock-clipper-secret");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS,GET");
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}
