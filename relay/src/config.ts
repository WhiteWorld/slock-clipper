import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";

export interface RelayConfig {
  host: string;
  port: number;
  relaySecret: string;
  agentId: string;
  slockCliPath: string;
  agentTokenFile: string;
  serverUrl: string;
  defaultTarget: string;
  defaultMention?: string;
}

export function loadConfig(): RelayConfig {
  const configPath = resolve(process.env.SLOCK_CLIPPER_CONFIG ?? "relay/config.json");
  const raw = JSON.parse(readFileSync(configPath, "utf8")) as Record<string, unknown>;

  const agentId: string = required(raw.agentId, "agentId");
  const agentDir = resolve(homedir(), ".slock", "agents", agentId);

  const config: RelayConfig = {
    host: stringValue(raw.host, "127.0.0.1"),
    port: numberValue(raw.port, 9321),
    relaySecret: required(raw.relaySecret, "relaySecret"),
    agentId,
    slockCliPath: stringValue(raw.slockCliPath, resolve(agentDir, ".slock", "slock")),
    agentTokenFile: stringValue(raw.agentTokenFile, resolve(agentDir, ".slock", "agent-token")),
    serverUrl: stringValue(raw.serverUrl, "https://api.slock.ai"),
    defaultTarget: required(raw.defaultTarget, "defaultTarget"),
    defaultMention: stringValue(raw.defaultMention, "")
  };

  if (config.host !== "127.0.0.1" && config.host !== "localhost") {
    throw new Error("Refusing to start: host must be 127.0.0.1 or localhost");
  }

  if (!config.relaySecret || config.relaySecret === "change-me-to-a-random-local-secret") {
    throw new Error("Set a strong relaySecret in relay/config.json before starting");
  }

  return config;
}

function required(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing required config field: ${name}`);
  }
  return value.trim();
}

function stringValue(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return fallback;
}

function numberValue(value: unknown, fallback: number): number {
  if (value === undefined || value === null) {
    return fallback;
  }
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1024 || value > 65535) {
    throw new Error("port must be an integer between 1024 and 65535");
  }
  return value;
}
