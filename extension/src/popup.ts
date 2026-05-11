import { getSettings } from "./settings.js";
import { sendToRelay } from "./share.js";

const titleInput = document.querySelector<HTMLInputElement>("#title")!;
const urlInput = document.querySelector<HTMLInputElement>("#url")!;
const noteInput = document.querySelector<HTMLTextAreaElement>("#note")!;
const targetInput = document.querySelector<HTMLInputElement>("#target")!;
const statusEl = document.querySelector<HTMLParagraphElement>("#status")!;
const sendButton = document.querySelector<HTMLButtonElement>("#send")!;
const optionsButton = document.querySelector<HTMLButtonElement>("#open-options")!;

void init();

async function init(): Promise<void> {
  const settings = await getSettings();
  targetInput.value = settings.defaultTarget;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  titleInput.value = tab?.title ?? "";
  urlInput.value = tab?.url ?? "";

  sendButton.addEventListener("click", () => {
    void sendCurrentPage();
  });
  optionsButton.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });
}

async function sendCurrentPage(): Promise<void> {
  setStatus("Sending...");
  sendButton.disabled = true;
  try {
    const result = await sendToRelay({
      type: "page",
      title: titleInput.value,
      url: urlInput.value,
      note: noteInput.value,
      target: targetInput.value
    });
    setStatus(`Sent${result.messageId ? `: ${result.messageId.slice(0, 8)}` : ""}`);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Failed to send");
  } finally {
    sendButton.disabled = false;
  }
}

function setStatus(message: string): void {
  statusEl.textContent = message;
}
