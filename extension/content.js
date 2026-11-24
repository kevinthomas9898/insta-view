/**
 * InstaView Content Script for instagram.com
 * Multi-layer media extractor for Stories, Feed Posts, Carousels, and Reels.
 * 
 * Features:
 * - Accurately captures high-res images and videos
 * - Excludes profile pictures / avatar thumbnails
 * - Handles HTML5 currentSrc, srcset, and MSE video streams via Performance API
 * - Native action-bar integration next to like/comment buttons
 */

(function () {
  'use strict';

  console.log('[InstaView] Content script initialized on instagram.com');

  /**
   * Helper to download a URL with proper filename
   */
  function triggerDownload(url, filename) {
    if (!url) return;

    chrome.runtime.sendMessage(
      {
        action: 'download_media',
        url: url,
        filename: filename || `instagram_${Date.now()}.${url.includes('.mp4') ? 'mp4' : 'jpg'}`,
      },
      (res) => {
        // Fallback to direct anchor click if background download fails
        if (!res || !res.success) {
          try {
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || `instagram_${Date.now()}`;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } catch (e) {
            window.open(url, '_blank');
          }
        }
      }
    );
  }

  /**
   * Parse srcset to get the absolute highest resolution URL
   */
  function getHighestResFromSrcset(img) {
    if (!img) return null;

    if (img.srcset) {
      try {
        const parts = img.srcset.split(',').map((s) => s.trim().split(' '));
        parts.sort((a, b) => {
          const wA = parseInt(a[1], 10) || 0;
          const wB = parseInt(b[1], 10) || 0;
          return wB - wA;
        });
        if (parts[0] && parts[0][0]) {
          return parts[0][0];
        }
      } catch {}
    }

    return img.currentSrc || img.src || null;
  }

  /**
   * Extract video stream from browser Performance Resource Timing
   */
  function getRecentVideoFromPerformance() {
    try {
      const entries = performance.getEntriesByType('resource');
      for (let i = entries.length - 1; i >= 0; i--) {
        const name = entries[i].name;
        if (
          (name.includes('.mp4') || name.includes('video_dash') || name.includes('bytestart')) &&
          (name.includes('cdninstagram.com') || name.includes('fbcdn.net'))
        ) {
          return name;
        }
      }
    } catch {}
    return null;
  }

  /**
   * Extract media from a Post container
   */
  function extractMediaFromContainer(btn) {
    // Find closest container: article, dialog (post modal), or parent section
    const container =
      btn.closest('article') ||
      btn.closest('div[role="dialog"]') ||
      btn.closest('main') ||
      btn.parentElement?.closest('div[style*="flex"]') ||
      document;

    // --- 1. Check for Video Element ---
    const videos = Array.from(container.querySelectorAll('video'));
    for (const v of videos) {
      const directSrc = v.currentSrc || v.src || v.querySelector('source')?.src;
      if (directSrc && directSrc.startsWith('http') && !directSrc.startsWith('blob:')) {
        return { type: 'video', url: directSrc };
      }
    }

    // If video element exists but uses blob or MSE, check Performance API
    if (videos.length > 0) {
      const perfVideo = getRecentVideoFromPerformance();
      if (perfVideo) {
        return { type: 'video', url: perfVideo };
      }
    }

    // --- 2. Check for Image Element ---
    const allImgs = Array.from(container.querySelectorAll('img'));
    const validImgs = allImgs.filter((img) => {
      // Ignore avatar in <header>
      if (img.closest('header')) return false;

      // Ignore profile picture alt text
      const alt = (img.alt || '').toLowerCase();
      if (alt.includes('profile picture') || alt.includes('profile photo') || alt.includes('avatar')) {
        return false;
      }

      // Ignore 1x1 tracking gifs or small icons
      const w = img.naturalWidth || img.clientWidth || img.width || 0;
      const h = img.naturalHeight || img.clientHeight || img.height || 0;
      if (w < 120 && h < 120) return false;

      // Ignore placeholder SVG data URLs
      const src = img.currentSrc || img.src || '';
      if (src.startsWith('data:image/svg') || src.startsWith('data:image/gif')) return false;

      return true;
    });

    if (validImgs.length > 0) {
      // Pick the image closest vertically to the button (handles carousels)
      let targetImg = validImgs[0];
      if (validImgs.length > 1) {
        const btnRect = btn.getBoundingClientRect();
        let minDistance = Infinity;

        for (const img of validImgs) {
          const r = img.getBoundingClientRect();
          if (r.width > 120 && r.height > 120) {
            const dist = Math.abs(btnRect.top - r.bottom);
            if (dist < minDistance) {
              minDistance = dist;
              targetImg = img;
            }
          }
        }
      }

      const bestUrl = getHighestResFromSrcset(targetImg);
      if (bestUrl) {
        return { type: 'image', url: bestUrl };
      }
    }

    // --- 3. Fallback: Performance Timing for recent photo ---
    try {
      const entries = performance.getEntriesByType('resource');
      for (let i = entries.length - 1; i >= 0; i--) {
        const name = entries[i].name;
        if (
          (name.includes('cdninstagram.com') || name.includes('fbcdn.net')) &&
          (name.includes('.jpg') || name.includes('dst-jpg') || name.includes('_n.jpg')) &&
          !name.includes('s150x150') &&
          !name.includes('s320x320') &&
          !name.includes('avatar')
        ) {
          return { type: 'image', url: name };
        }
      }
    } catch {}

    return null;
  }

  /**
   * Handle Click on Feed/Reel Download Button
   */
  async function handleDownloadClick(btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Finding...';

    try {
      const media = extractMediaFromContainer(btn);

      if (media && media.url) {
        const ext = media.type === 'video' ? 'mp4' : 'jpg';
        triggerDownload(media.url, `instagram_${media.type}_${Date.now()}.${ext}`);
        btn.innerHTML = '✓ Saved!';
        setTimeout(() => (btn.innerHTML = originalText), 2000);
        return;
      }

      // If still not found, check if video exists and try playing briefly
      const container = btn.closest('article') || btn.closest('div[role="dialog"]') || document;
      const v = container.querySelector('video');
      if (v) {
        // Try play to populate stream
        try {
          await v.play();
        } catch {}
        const perfUrl = getRecentVideoFromPerformance();
        if (perfUrl) {
          triggerDownload(perfUrl, `instagram_video_${Date.now()}.mp4`);
          btn.innerHTML = '✓ Saved!';
          setTimeout(() => (btn.innerHTML = originalText), 2000);
          return;
        }
      }

      alert('InstaView: Could not locate media URL. Please ensure the post is visible on screen.');
      btn.innerHTML = originalText;
    } catch (err) {
      console.error('[InstaView] Download error:', err);
      btn.innerHTML = originalText;
    }
  }

  /**
   * Inject button into Post action bar
   */
  function injectPostButton(actionContainer) {
    if (actionContainer.querySelector('.instaview-dl-btn')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'instaview-dl-btn';
    btn.innerHTML = '⬇ Download';
    btn.title = 'Download High-Res Media with InstaView';

    btn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      handleDownloadClick(btn);
    };

    actionContainer.appendChild(btn);
  }

  /**
   * Story Downloader
   */
  function injectStoryButton() {
    if (document.querySelector('.instaview-story-btn')) return;

    const storyContainer =
      document.querySelector('section._ac0a') ||
      document.querySelector('div._ac0b') ||
      document.querySelector('section[role="region"]') ||
      document.querySelector('section');

    if (!storyContainer) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'instaview-dl-btn instaview-story-btn';
    btn.innerHTML = '⬇ Download Story';
    btn.title = 'Download current active story';

    btn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      const originalText = btn.innerHTML;
      btn.innerHTML = '⏳ Saving...';

      // 1. Check for active story video
      const v = document.querySelector('video');
      if (v) {
        const directSrc = v.currentSrc || v.src;
        if (directSrc && directSrc.startsWith('http') && !directSrc.startsWith('blob:')) {
          triggerDownload(directSrc, `story_${Date.now()}.mp4`);
          btn.innerHTML = '✓ Saved!';
          setTimeout(() => (btn.innerHTML = originalText), 2000);
          return;
        }
        const perf = getRecentVideoFromPerformance();
        if (perf) {
          triggerDownload(perf, `story_${Date.now()}.mp4`);
          btn.innerHTML = '✓ Saved!';
          setTimeout(() => (btn.innerHTML = originalText), 2000);
          return;
        }
      }

      // 2. Check for active story image
      const imgs = Array.from(document.querySelectorAll('img')).filter((img) => {
        if (img.closest('header')) return false;
        const alt = (img.alt || '').toLowerCase();
        if (alt.includes('profile picture') || alt.includes('profile photo')) return false;
        const w = img.clientWidth || img.naturalWidth || 0;
        const h = img.clientHeight || img.naturalHeight || 0;
        return w > 200 || h > 200;
      });

      if (imgs.length > 0) {
        const highRes = getHighestResFromSrcset(imgs[0]);
        if (highRes) {
          triggerDownload(highRes, `story_${Date.now()}.jpg`);
          btn.innerHTML = '✓ Saved!';
          setTimeout(() => (btn.innerHTML = originalText), 2000);
          return;
        }
      }

      alert('InstaView: Could not capture active story frame. Please try again.');
      btn.innerHTML = originalText;
    };

    document.body.appendChild(btn);
  }

  /**
   * DOM Observer to scan for Posts, Reels, and Stories
   */
  const observer = new MutationObserver(() => {
    // 1. Stories check
    if (window.location.pathname.startsWith('/stories/')) {
      injectStoryButton();
    } else {
      const existing = document.querySelector('.instaview-story-btn');
      if (existing) existing.remove();
    }

    // 2. Feed Posts and Reels check
    // Look for native action bars containing SVG icons (like, comment, share)
    const svgs = document.querySelectorAll('svg[aria-label="Like"], svg[aria-label="Comment"], svg[aria-label="Share"], svg[aria-label="Save"]');
    svgs.forEach((svg) => {
      // Traverse to the button's parent section/div
      const section = svg.closest('section') || svg.closest('div[role="presentation"]');
      if (section && !section.querySelector('.instaview-dl-btn')) {
        injectPostButton(section);
      }
    });

    // Also scan articles as fallback
    const articles = document.querySelectorAll('article');
    articles.forEach((art) => {
      const sec = art.querySelector('section');
      if (sec && !sec.querySelector('.instaview-dl-btn')) {
        injectPostButton(sec);
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
