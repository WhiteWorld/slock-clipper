import { sendToRelay } from "./share.js";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "slock-clipper-page",
    title: "Send page to Slock",
    contexts: ["page"]
  });

  chrome.contextMenus.create({
    id: "slock-clipper-selection",
    title: "Send selection to Slock",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  void handleContextMenu(info, tab);
});

async function handleContextMenu(info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab): Promise<void> {
  try {
    if (info.menuItemId === "slock-clipper-selection") {
      await sendToRelay({
        type: "selection",
        title: tab?.title,
        url: tab?.url,
        selection: info.selectionText
      });
    } else {
      await sendToRelay({
        type: "page",
        title: tab?.title,
        url: tab?.url
      });
    }

    // Show feedback on extension icon
    await chrome.action.setBadgeText({ text: "✓" });
    await chrome.action.setBadgeBackgroundColor({ color: "#3fb077" });
    await chrome.action.setTitle({ title: "Slock Clipper — Sent ✓" });
    // Also show a brief notification that auto-closes
    await chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon-128.png",
      title: "Slock Clipper",
      message: "Sent ✓",
      silent: true
    });
    setTimeout(() => {
      void chrome.action.setBadgeText({ text: "" });
    }, 4000);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed";
    await chrome.action.setBadgeText({ text: "✗" });
    await chrome.action.setBadgeBackgroundColor({ color: "#e53e3e" });
    await chrome.action.setTitle({ title: `Slock Clipper — ${msg}` });
    setTimeout(() => {
      void chrome.action.setBadgeText({ text: "" });
    }, 5000);
  }
}
