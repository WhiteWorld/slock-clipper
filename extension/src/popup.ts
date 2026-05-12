import { getSettings } from "./settings.js";
import { sendToRelay } from "./share.js";

// Grab DOM elements — fail loudly if critical ones are missing
const statusEl = document.querySelector<HTMLParagraphElement>("#status")!;
const sendButton = document.querySelector<HTMLButtonElement>("#send")!;
const optionsButton = document.querySelector<HTMLButtonElement>("#open-options")!;

// Register event listeners synchronously so buttons always work
optionsButton.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
});

sendButton.addEventListener("click", () => {
  void sendCurrentPage();
});

// Keyboard shortcut: Ctrl/Cmd + Enter to send
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    void sendCurrentPage();
  }
});

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

    // Auto-focus title for quick editing
    titleInput?.focus();
    titleInput?.select();
  } catch (err) {
    setStatus("Init error: " + (err instanceof Error ? err.message : String(err)));
  }
}

async function sendCurrentPage(): Promise<void> {
  const titleInput = document.querySelector<HTMLInputElement>("#title");
  const urlInput = document.querySelector<HTMLInputElement>("#url");
  const noteInput = document.querySelector<HTMLInputElement>("#note");
  const targetInput = document.querySelector<HTMLInputElement>("#target");

  setStatus("⏳ Sending...");
  sendButton.disabled = true;
  sendButton.textContent = "Sending...";

  try {
    const result = await sendToRelay({
      type: "page",
      title: titleInput?.value?.trim() ?? "",
      url: urlInput?.value?.trim() ?? "",
      note: noteInput?.value?.trim() ?? "",
      target: targetInput?.value?.trim() ?? "",
    });

    setStatus("✅ Sent");
    sendButton.textContent = "Sent ✓";

    // Auto-close popup after brief success feedback
    setTimeout(() => {
      window.close();
    }, 800);
  } catch (error) {
    sendButton.disabled = false;
    sendButton.textContent = "Send to Slock";
    setStatus("❌ " + (error instanceof Error ? error.message : "Failed to send"));
  }
}

function setStatus(message: string): void {
  statusEl.textContent = message;
}
