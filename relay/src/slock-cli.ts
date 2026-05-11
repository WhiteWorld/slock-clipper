import { spawn } from "node:child_process";
import type { RelayConfig } from "./config.js";

export interface SlockSendResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  messageId?: string;
}

export function sendSlockMessage(config: RelayConfig, target: string, content: string): Promise<SlockSendResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(config.slockCliPath, ["message", "send", "--target", target], {
      env: {
        ...process.env,
        SLOCK_AGENT_ID: config.agentId,
        SLOCK_CURRENT_AGENT_ID: config.agentId,
        SLOCK_AGENT_TOKEN_FILE: config.agentTokenFile,
        SLOCK_SERVER_URL: config.serverUrl
      },
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      const result: SlockSendResult = {
        ok: code === 0,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        messageId: parseMessageId(stdout)
      };
      resolve(result);
    });

    child.stdin.end(content);
  });
}

function parseMessageId(stdout: string): string | undefined {
  const match = stdout.match(/Message ID:\s+([a-f0-9-]+)/i);
  return match?.[1];
}
