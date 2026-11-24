/**
 * InstaView Content Script for instagram.com
 * Accurately extracts high-res post images, carousel slides, reels, and stories.
 * Explicitly ignores profile avatars / header thumbnails.
 */

(function () {
  'use strict';

  console.log('[InstaView] Content script active on instagram.com');

  /**
   * Helper to trigger download via background script or fallback anchor
   */
  function triggerDownload(url, filename) {
    if (!url) return;

    // Direct download via background service worker
    chrome.runtime.sendMessage(
      {
        action: 'download_media',
        url: url,
        filename: filename || `instagram_${Date.now()}.${url.includes('.mp4') ? 'mp4' : 'jpg'}`,
      },
      (res) => {
        // Fallback to DOM anchor click if background downloads failed
        if (!res || !res.success) {
          try {
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || `instagram_${Date.now()}`;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } catch (e) {
            console.error('[InstaView] Download fallback failed:', e);
          }
        }
      }
    );
  }

  /**
   * Extract highest resolution URL from an <img> srcset
   */
  function getHighestResUrl(img) {
    if (!img) return null;

    if (img.srcset) {
      const parts = img.srcset.split(',').map((s) => s.trim().split(' '));
      // Sort descending by width (e.g. 1080w, 750w, 640w)
      parts.sort((a, b) => {
        const wA = parseInt(a[1], 10) || 0;
        const wB = parseInt(b[1], 10) || 0;
        return wB - wA;
      });
      if (parts[0] && parts[0][0]) {
        return parts[0][0];
      }
    }

    return img.src || null;
  }

  /**
   * Deep search React Fiber / Props to find native CDN media URLs (video_versions or image_versions2)
   */
  function searchReactTree(node, depth = 0) {
    if (!node || depth > 8) return null;

    // Check direct video versions
    if (Array.isArray(node.video_versions) && node.video_versions.length > 0) {
      const best = node.video_versions[0];
      if (best?.url) return { type: 'video', url: best.url };
    }

    // Check direct image candidates
    if (node.image_versions2?.candidates && Array.isArray(node.image_versions2.candidates)) {
      const best = node.image_versions2.candidates[0];
      if (best?.url) return { type: 'image', url: best.url };
    }

    // Check carousel items
    if (Array.isArray(node.carousel_media)) {
      const first = node.carousel_media[0];
      if (first?.video_versions?.[0]?.url) return { type: 'video', url: first.video_versions[0].url };
      if (first?.image_versions2?.candidates?.[0]?.url) return { type: 'image', url: first.image_versions2.candidates[0].url };
    }

    // Recurse into memoizedProps or stateNode
    if (node.memoizedProps) {
      const found = searchReactTree(node.memoizedProps, depth + 1);
      if (found) return found;
    }
    if (node.return) {
      const found = searchReactTree(node.return, depth + 1);
      if (found) return found;
    }

    return null;
  }

  function getReactMedia(el) {
    if (!el) return null;
    let curr = el;
    for (let i = 0; i < 6 && curr; i++) {
      const key = Object.keys(curr).find(
        (k) => k.startsWith('__reactFiber$') || k.startsWith('__reactProps$')
      );
      if (key && curr[key]) {
        const found = searchReactTree(curr[key], 0);
        if (found) return found;
      }
      curr = curr.parentElement;
    }
    return null;
  }

  /**
   * Filter and return TRUE post images (strictly excluding profile avatars)
   */
  function getPostImages(article) {
    const allImgs = Array.from(article.querySelectorAll('img'));

    return allImgs.filter((img) => {
      // 1. Exclude anything inside <header> (post author avatar)
      if (img.closest('header')) return false;

      // 2. Exclude anything inside a circular avatar wrapper or with profile alt text
      const alt = (img.alt || '').toLowerCase();
      if (alt.includes('profile picture') || alt.includes('profile photo') || alt.includes('avatar')) {
        return false;
      }

      // 3. Exclude small icons/thumbnails (avatars are usually 32px or 44px)
      const rect = img.getBoundingClientRect();
      const naturalWidth = img.naturalWidth || 0;
      if (rect.width < 150 && naturalWidth < 150) {
        return false;
      }

      // 4. Must be inside the main media section
      return true;
    });
  }

  /**
   * Find the currently visible slide in a carousel or single post
   */
  function getVisiblePostImage(article) {
    const validImgs = getPostImages(article);
    if (validImgs.length === 0) return null;
    if (validImgs.length === 1) return validImgs[0];

    // In a carousel, find the image with the largest visible area inside the article
    const articleRect = article.getBoundingClientRect();
    let bestImg = validImgs[0];
    let maxVisibleWidth = 0;

    for (const img of validImgs) {
      const rect = img.getBoundingClientRect();
      const visibleWidth = Math.min(rect.right, articleRect.right) - Math.max(rect.left, articleRect.left);
      if (visibleWidth > maxVisibleWidth) {
        maxVisibleWidth = visibleWidth;
        bestImg = img;
      }
    }

    return bestImg;
  }

  /**
   * Find visible video element in post/reel
   */
  function getVisiblePostVideo(article) {
    const videos = Array.from(article.querySelectorAll('video'));
    if (videos.length === 0) return null;

    // Filter to videos that have valid size (not hidden tracker)
    const valid = videos.filter((v) => {
      const rect = v.getBoundingClientRect();
      return rect.width > 150 || rect.height > 150;
    });

    return valid[0] || videos[0];
  }

  /**
   * Download Handler for Feed Posts & Reels
   */
  async function handlePostDownload(article, btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Finding...';

    try {
      // Step 1: Check for Video in the post
      const videoEl = getVisiblePostVideo(article);
      if (videoEl) {
        // 1a. Direct https video source
        if (videoEl.src && videoEl.src.startsWith('http') && !videoEl.src.startsWith('blob:')) {
          triggerDownload(videoEl.src, `instagram_video_${Date.now()}.mp4`);
          btn.innerHTML = '✓ Saved!';
          setTimeout(() => (btn.innerHTML = originalText), 2000);
          return;
        }

        // 1b. Search React Fiber for direct MP4 URL
        const reactData = getReactMedia(videoEl) || getReactMedia(article);
        if (reactData && reactData.type === 'video' && reactData.url) {
          triggerDownload(reactData.url, `instagram_video_${Date.now()}.mp4`);
          btn.innerHTML = '✓ Saved!';
          setTimeout(() => (btn.innerHTML = originalText), 2000);
          return;
        }

        // 1c. If blob URL, fetch blob in page context and trigger download
        if (videoEl.src && videoEl.src.startsWith('blob:')) {
          try {
            const blobRes = await fetch(videoEl.src);
            const blob = await blobRes.blob();
            const blobUrl = URL.createObjectURL(blob);
            triggerDownload(blobUrl, `instagram_video_${Date.now()}.mp4`);
            btn.innerHTML = '✓ Saved!';
            setTimeout(() => (btn.innerHTML = originalText), 2000);
            return;
          } catch {}
        }
      }

      // Step 2: Check for Image in the post
      const imgEl = getVisiblePostImage(article);
      if (imgEl) {
        const highResUrl = getHighestResUrl(imgEl);
        if (highResUrl) {
          triggerDownload(highResUrl, `instagram_photo_${Date.now()}.jpg`);
          btn.innerHTML = '✓ Saved!';
          setTimeout(() => (btn.innerHTML = originalText), 2000);
          return;
        }
      }

      // Step 3: Check React Fiber directly on article
      const reactData = getReactMedia(article);
      if (reactData && reactData.url) {
        const ext = reactData.type === 'video' ? 'mp4' : 'jpg';
        triggerDownload(reactData.url, `instagram_${reactData.type}_${Date.now()}.${ext}`);
        btn.innerHTML = '✓ Saved!';
        setTimeout(() => (btn.innerHTML = originalText), 2000);
        return;
      }

      alert('InstaView: Could not extract media. If this is a video, play it for 1 second and click Download again.');
      btn.innerHTML = originalText;
    } catch (err) {
      console.error('[InstaView] Error during download:', err);
      btn.innerHTML = originalText;
    }
  }

  /**
   * Process and inject button into feed post
   */
  function processArticle(article) {
    if (article.querySelector('.instaview-dl-btn')) return;

    // Locate the post action bar (where like, comment, share buttons reside)
    const actionBar =
      article.querySelector('section._aamu') ||
      article.querySelector('section._ae5m') ||
      article.querySelector('section') ||
      article.querySelector('div[role="presentation"]');

    if (!actionBar) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'instaview-dl-btn';
    btn.innerHTML = '⬇ Download';
    btn.title = 'Download High-Res Media with InstaView';

    btn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      handlePostDownload(article, btn);
    };

    actionBar.appendChild(btn);
  }

  /**
   * Process Story Viewer
   */
  function injectStoryDownloadButton() {
    if (document.querySelector('.instaview-story-btn')) return;

    // Check if we are inside story viewer
    const storySection = document.querySelector('section._ac0a') || document.querySelector('div._ac0b') || document.querySelector('section');
    if (!storySection) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'instaview-dl-btn instaview-story-btn';
    btn.innerHTML = '⬇ Download Story';
    btn.title = 'Download current active story';

    btn.onclick = async (e) => {
      e.stopPropagation();
      e.preventDefault();
      const originalText = btn.innerHTML;
      btn.innerHTML = '⏳ Saving...';

      // 1. Look for active story video
      const storyVideo = document.querySelector('video[src], video');
      if (storyVideo) {
        if (storyVideo.src && storyVideo.src.startsWith('http') && !storyVideo.src.startsWith('blob:')) {
          triggerDownload(storyVideo.src, `story_${Date.now()}.mp4`);
          btn.innerHTML = '✓ Saved!';
          setTimeout(() => (btn.innerHTML = originalText), 2000);
          return;
        }

        const reactData = getReactMedia(storyVideo);
        if (reactData?.url) {
          triggerDownload(reactData.url, `story_${Date.now()}.mp4`);
          btn.innerHTML = '✓ Saved!';
          setTimeout(() => (btn.innerHTML = originalText), 2000);
          return;
        }
      }

      // 2. Look for active story image (strictly excluding profile avatars)
      const allImgs = Array.from(document.querySelectorAll('img')).filter((img) => {
        if (img.closest('header')) return false;
        const alt = (img.alt || '').toLowerCase();
        if (alt.includes('profile picture') || alt.includes('profile photo')) return false;
        const rect = img.getBoundingClientRect();
        return rect.width > 200 || rect.height > 200;
      });

      if (allImgs.length > 0) {
        // Largest image is the full-screen story image
        const storyImg = allImgs[0];
        const highResUrl = getHighestResUrl(storyImg);
        if (highResUrl) {
          triggerDownload(highResUrl, `story_${Date.now()}.jpg`);
          btn.innerHTML = '✓ Saved!';
          setTimeout(() => (btn.innerHTML = originalText), 2000);
          return;
        }
      }

      btn.innerHTML = originalText;
      alert('InstaView: Could not capture active story frame. Please try again.');
    };

    document.body.appendChild(btn);
  }

  /**
   * Continuous DOM Observer
   */
  const observer = new MutationObserver(() => {
    // Check Stories
    if (window.location.pathname.startsWith('/stories/')) {
      injectStoryDownloadButton();
    } else {
      const existingBtn = document.querySelector('.instaview-story-btn');
      if (existingBtn) existingBtn.remove();
    }

    // Check Feed & Reels
    const articles = document.querySelectorAll('article');
    articles.forEach(processArticle);
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
