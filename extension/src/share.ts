import { getSettings } from "./settings.js";

export interface ExtensionSharePayload {
  type?: "page" | "selection" | "note" | "code";
  title?: string;
  url?: string;
  selection?: string;
  note?: string;
  target?: string;
}

export async function sendToRelay(payload: ExtensionSharePayload): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const settings = await getSettings();
  if (!settings.relaySecret) {
    throw new Error("Relay secret is not configured. Open Slock Clipper settings first.");
  }

  const response = await fetch(`${settings.relayUrl}/share`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-slock-clipper-secret": settings.relaySecret
    },
    body: JSON.stringify({
      target: payload.target || settings.defaultTarget,
      source: "chrome-extension",
      ...payload
    })
  });

  const body = (await response.json()) as { ok: boolean; messageId?: string; error?: string };
  if (!response.ok || !body.ok) {
    throw new Error(body.error ?? `Relay returned HTTP ${response.status}`);
  }
  return body;
}
