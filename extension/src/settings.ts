export interface Settings {
  relayUrl: string;
  relaySecret: string;
  defaultTarget: string;
  defaultMention: string;
}

export const defaultSettings: Settings = {
  relayUrl: "http://127.0.0.1:9321",
  relaySecret: "",
  defaultTarget: "#收藏",
  defaultMention: "@Reader"
};

export async function getSettings(): Promise<Settings> {
  const stored = await chrome.storage.sync.get({ ...defaultSettings });
  return {
    relayUrl: String(stored.relayUrl ?? defaultSettings.relayUrl).replace(/\/+$/, ""),
    relaySecret: String(stored.relaySecret ?? ""),
    defaultTarget: String(stored.defaultTarget ?? defaultSettings.defaultTarget),
    defaultMention: String(stored.defaultMention ?? defaultSettings.defaultMention)
  };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.sync.set(settings);
}
