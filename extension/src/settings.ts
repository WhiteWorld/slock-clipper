export interface Settings {
  relayUrl: string;
  relaySecret: string;
  defaultTarget: string;
  extractText: boolean;
}

export const defaultSettings: Settings = {
  relayUrl: "http://127.0.0.1:9321",
  relaySecret: "",
  defaultTarget: "#收藏",
  extractText: false,
};

export async function getSettings(): Promise<Settings> {
  const stored = await chrome.storage.sync.get({ ...defaultSettings });
  return {
    relayUrl: String(stored.relayUrl ?? defaultSettings.relayUrl).replace(/\/+$/, ""),
    relaySecret: String(stored.relaySecret ?? ""),
    defaultTarget: String(stored.defaultTarget ?? defaultSettings.defaultTarget),
    extractText: Boolean(stored.extractText ?? defaultSettings.extractText),
  };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.sync.set(settings);
}
