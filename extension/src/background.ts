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

    await notify("Sent to Slock");
  } catch (error) {
    await notify(error instanceof Error ? error.message : "Failed to send to Slock");
  }
}

async function notify(message: string): Promise<void> {
  await chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon-128.png",
    title: "Slock Clipper",
    message
  });
}
