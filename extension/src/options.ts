import { getSettings, saveSettings } from "./settings.js";

const relayUrlInput = document.querySelector<HTMLInputElement>("#relayUrl")!;
const relaySecretInput = document.querySelector<HTMLInputElement>("#relaySecret")!;
const defaultTargetInput = document.querySelector<HTMLInputElement>("#defaultTarget")!;
const saveButton = document.querySelector<HTMLButtonElement>("#save")!;
const statusEl = document.querySelector<HTMLParagraphElement>("#status")!;

void init();

async function init(): Promise<void> {
  const settings = await getSettings();
  relayUrlInput.value = settings.relayUrl;
  relaySecretInput.value = settings.relaySecret;
  defaultTargetInput.value = settings.defaultTarget;

  saveButton.addEventListener("click", () => {
    void save();
  });
}

async function save(): Promise<void> {
  await saveSettings({
    relayUrl: relayUrlInput.value.trim().replace(/\/+$/, ""),
    relaySecret: relaySecretInput.value.trim(),
    defaultTarget: defaultTargetInput.value.trim()
  });
  statusEl.textContent = "Saved.";
}
