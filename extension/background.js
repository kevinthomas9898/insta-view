// InstaView Background Service Worker (Manifest V3)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'download_media') {
    const filename = request.filename || `instagram_${Date.now()}.${request.url.includes('.mp4') ? 'mp4' : 'jpg'}`;

    // Direct Chrome downloads API
    chrome.downloads.download(
      {
        url: request.url,
        filename: filename,
        saveAs: false,
      },
      (downloadId) => {
        if (chrome.runtime.lastError || !downloadId) {
          // Fallback: fetch blob directly in service worker and download as object URL / data URL
          fetch(request.url)
            .then((res) => res.blob())
            .then((blob) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                chrome.downloads.download({
                  url: reader.result,
                  filename: filename,
                  saveAs: false,
                }, (blobDlId) => {
                  sendResponse({ success: Boolean(blobDlId), downloadId: blobDlId });
                });
              };
              reader.readAsDataURL(blob);
            })
            .catch((err) => {
              sendResponse({ success: false, error: err.message });
            });
        } else {
          sendResponse({ success: true, downloadId });
        }
      }
    );
    return true; // Keep message channel open for async response
  }
});
