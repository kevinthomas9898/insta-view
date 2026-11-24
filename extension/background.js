// InstaView Background Service Worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'download_media') {
    chrome.downloads.download({
      url: request.url,
      filename: request.filename || 'instagram_media.mp4',
      saveAs: false,
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, downloadId });
      }
    });
    return true; // Keep message channel open for async response
  }
});
