import { getSettings } from "./settings.js";
import { sendToRelay } from "./share.js";

// Grab DOM elements — fail loudly if critical ones are missing
const statusEl = document.querySelector<HTMLParagraphElement>("#status")!;

// Register event listeners synchronously so buttons always work
const optionsButton = document.querySelector<HTMLButtonElement>("#open-options");
if (optionsButton) {
  optionsButton.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });
}

const sendButton = document.querySelector<HTMLButtonElement>("#send");
if (sendButton) {
  sendButton.addEventListener("click", () => {
    void sendCurrentPage();
  });
}

// Async init: fill in page title/URL from the active tab
void init();

async function init(): Promise<void> {
  try {
    const settings = await getSettings();
    const targetInput = document.querySelector<HTMLInputElement>("#target");
    if (targetInput) targetInput.value = settings.defaultTarget;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const titleInput = document.querySelector<HTMLInputElement>("#title");
    const urlInput = document.querySelector<HTMLInputElement>("#url");
    if (titleInput) titleInput.value = tab?.title ?? "";
    if (urlInput) urlInput.value = tab?.url ?? "";
  } catch (err) {
    setStatus("Init error: " + (err instanceof Error ? err.message : String(err)));
  }
}

async function sendCurrentPage(): Promise<void> {
  const titleInput = document.querySelector<HTMLInputElement>("#title");
  const urlInput = document.querySelector<HTMLInputElement>("#url");
  const noteInput = document.querySelector<HTMLTextAreaElement>("#note");
  const targetInput = document.querySelector<HTMLInputElement>("#target");

  setStatus("Sending...");
  if (sendButton) sendButton.disabled = true;
  try {
    const result = await sendToRelay({
      type: "page",
      title: titleInput?.value ?? "",
      url: urlInput?.value ?? "",
      note: noteInput?.value ?? "",
      target: targetInput?.value ?? "",
    });
    setStatus(`Sent${result.messageId ? `: ${result.messageId.slice(0, 8)}` : ""}`);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Failed to send");
  } finally {
    if (sendButton) sendButton.disabled = false;
  }
}

function setStatus(message: string): void {
  statusEl.textContent = message;
}
