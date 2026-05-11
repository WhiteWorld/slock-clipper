import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface RelayConfig {
  host: string;
  port: number;
  relaySecret: string;
  slockCliPath: string;
  agentId: string;
  agentTokenFile: string;
  serverUrl: string;
  defaultTarget: string;
  defaultMention?: string;
}

export function loadConfig(): RelayConfig {
  const configPath = resolve(process.env.SLOCK_CLIPPER_CONFIG ?? "relay/config.json");
  const raw = JSON.parse(readFileSync(configPath, "utf8")) as Partial<RelayConfig>;

  const config: RelayConfig = {
    host: raw.host ?? "127.0.0.1",
    port: numberValue(raw.port, 9321),
    relaySecret: required(raw.relaySecret, "relaySecret"),
    slockCliPath: required(raw.slockCliPath, "slockCliPath"),
    agentId: required(raw.agentId, "agentId"),
    agentTokenFile: required(raw.agentTokenFile, "agentTokenFile"),
    serverUrl: raw.serverUrl ?? "https://api.slock.ai",
    defaultTarget: required(raw.defaultTarget, "defaultTarget"),
    defaultMention: raw.defaultMention
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

function numberValue(value: unknown, fallback: number): number {
  if (value === undefined || value === null) {
    return fallback;
  }
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1024 || value > 65535) {
    throw new Error("port must be an integer between 1024 and 65535");
  }
  return value;
}
