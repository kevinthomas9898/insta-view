/**
 * InstaView Content Script for instagram.com
 * Injects 1-Click Download Buttons into Stories, Feed Posts, Carousels, and Reels.
 * Downloads from public and followed private accounts directly using active DOM streams.
 */

(function () {
  'use strict';

  console.log('[InstaView] Extension initialized on instagram.com');

  // Trigger download helper
  function triggerDownload(url, filename) {
    if (!url) return;
    chrome.runtime.sendMessage({
      action: 'download_media',
      url: url,
      filename: filename || `instagram_${Date.now()}.${url.includes('.mp4') ? 'mp4' : 'jpg'}`,
    });
  }

  // 1. STORY DOWNLOADER
  function injectStoryDownloadButton() {
    const storyContainer = document.querySelector('section._ac0a, div._ac0b, section');
    if (!storyContainer || document.querySelector('.instaview-story-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'instaview-dl-btn instaview-story-btn';
    btn.innerHTML = '⬇ Download Story';
    btn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();

      // Find active story video or image
      const activeVideo = document.querySelector('video[src], video source');
      const activeImg = document.querySelector('img[srcset], img[src][crossorigin]');

      if (activeVideo && activeVideo.src) {
        triggerDownload(activeVideo.src, `story_${Date.now()}.mp4`);
      } else if (activeImg && activeImg.src) {
        triggerDownload(activeImg.src, `story_${Date.now()}.jpg`);
      } else {
        alert('Could not detect active story media. Please try again.');
      }
    };

    document.body.appendChild(btn);
  }

  // 2. FEED POSTS & REELS DOWNLOADER
  function processArticle(article) {
    if (article.querySelector('.instaview-dl-btn')) return;

    // Locate action bar (where like, comment, share buttons are)
    const actionBar = article.querySelector('section._aamu, section._ae5m, section');
    if (!actionBar) return;

    const btn = document.createElement('button');
    btn.className = 'instaview-dl-btn';
    btn.innerHTML = '⬇ Download';
    btn.title = 'Download with InstaView';

    btn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();

      // Check if video is present in this post
      const video = article.querySelector('video');
      if (video && video.src) {
        triggerDownload(video.src, `instagram_reel_${Date.now()}.mp4`);
        return;
      }

      // Check if image is present
      const img = article.querySelector('img[srcset], img[src]');
      if (img && img.src) {
        triggerDownload(img.src, `instagram_post_${Date.now()}.jpg`);
        return;
      }

      alert('No media found in this post');
    };

    actionBar.appendChild(btn);
  }

  // Continuous observer for dynamic Instagram feeds and story views
  const observer = new MutationObserver(() => {
    // Check stories
    if (window.location.pathname.startsWith('/stories/')) {
      injectStoryDownloadButton();
    } else {
      const existingStoryBtn = document.querySelector('.instaview-story-btn');
      if (existingStoryBtn) existingStoryBtn.remove();
    }

    // Check feed articles
    const articles = document.querySelectorAll('article');
    articles.forEach(processArticle);
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
