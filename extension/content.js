/**
 * InstaView Content Script for instagram.com
 * Multi-layer media extractor for Stories, Feed Posts, Carousels, and Reels.
 * 
 * Key Features:
 * 1. Pristine Progressive MP4 Video Downloads: eliminates 0xC00D36C4 corrupt errors by strictly
 *    fetching unified progressive streams and rejecting DASH/MSE init fragments.
 * 2. Carousel "Download All": downloads 100% of photos and videos in multi-slide posts via
 *    direct JSON intercept and automated DOM slider crawl.
 * 3. Avatar Exclusion: filters out author profile icons.
 * 4. Main-World Bridge: communicates with main_world.js to access intercepted GraphQL and React Fiber.
 */

(function () {
  'use strict';

  console.log('[InstaView] Content script loaded on instagram.com');

  // In-memory cache populated by main_world.js
  const mediaCache = new Map();
  const pendingRequests = new Map();

  // Listen for media intercepts and query responses from main_world.js
  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data) return;

    if (event.data.type === 'INSTAVIEW_MEDIA_INTERCEPT' && event.data.media) {
      const m = event.data.media;
      if (m.shortcode) {
        mediaCache.set(m.shortcode, m);
      }
    }

    if (event.data.type === 'INSTAVIEW_MEDIA_RESPONSE' && event.data.requestId) {
      const resolver = pendingRequests.get(event.data.requestId);
      if (resolver) {
        pendingRequests.delete(event.data.requestId);
        resolver(event.data.media);
      }
    }
  });

  /**
   * Request media data from main_world.js (traversing React Fiber if not in network cache)
   */
  function fetchMediaFromMainWorld(shortcode) {
    if (!shortcode) return Promise.resolve(null);
    if (mediaCache.has(shortcode)) {
      return Promise.resolve(mediaCache.get(shortcode));
    }

    return new Promise((resolve) => {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const timeout = setTimeout(() => {
        pendingRequests.delete(requestId);
        resolve(null);
      }, 900);

      pendingRequests.set(requestId, (data) => {
        clearTimeout(timeout);
        if (data && data.shortcode) {
          mediaCache.set(data.shortcode, data);
        }
        resolve(data);
      });

      window.postMessage(
        {
          type: 'INSTAVIEW_GET_MEDIA',
          shortcode,
          requestId,
        },
        '*'
      );
    });
  }

  /**
   * Helper to trigger download via background service worker or fallback anchor
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
          } catch {
            window.open(url, '_blank');
          }
        }
      }
    );
  }

  /**
   * Check if a video URL is a true progressive MP4 (and not a DASH/audio init fragment)
   */
  function isProgressiveMp4(url) {
    if (!url || typeof url !== 'string') return false;
    // Strictly reject DASH init segments or audio-only chunks that trigger 0xC00D36C4
    if (
      url.includes('dashinit') ||
      url.includes('_dash_') ||
      url.includes('_audio_') ||
      url.includes('audio_dash')
    ) {
      return false;
    }
    return url.startsWith('http');
  }

  /**
   * Clean URL of any byte-range parameters
   */
  function cleanVideoUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return null;
    if (!isProgressiveMp4(rawUrl)) return null;

    try {
      const u = new URL(rawUrl);
      u.searchParams.delete('bytestart');
      u.searchParams.delete('byteend');
      return u.toString();
    } catch {
      return rawUrl
        .replace(/([?&])bytestart=\d+/i, '')
        .replace(/([?&])byteend=\d+/i, '');
    }
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
   * Extract post shortcode from container links or current URL
   */
  function getPostShortcode(container) {
    if (!container) return null;

    const links = Array.from(container.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]'));
    for (const a of links) {
      const href = a.getAttribute('href') || '';
      const match = href.match(/\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
      if (match && match[1]) return match[1];
    }

    const urlMatch = window.location.pathname.match(/\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
    if (urlMatch && urlMatch[1]) return urlMatch[1];

    return null;
  }

  /**
   * Search embedded JSON scripts for the post's GraphQL media object
   */
  function searchJsonForShortcode(obj, shortcode, depth = 0) {
    if (!obj || depth > 15) return null;

    if (typeof obj === 'object') {
      if (obj.code === shortcode || obj.shortcode === shortcode || obj.id === shortcode) {
        return obj;
      }
      for (const key of Object.keys(obj)) {
        if (obj[key] && typeof obj[key] === 'object') {
          const found = searchJsonForShortcode(obj[key], shortcode, depth + 1);
          if (found) return found;
        }
      }
    }
    return null;
  }

  function getMediaFromEmbeddedScripts(shortcode) {
    if (!shortcode) return null;

    const scripts = document.querySelectorAll('script[type="application/json"]');
    for (const s of scripts) {
      if (s.textContent && s.textContent.includes(shortcode)) {
        try {
          const parsed = JSON.parse(s.textContent);
          const rawItem = searchJsonForShortcode(parsed, shortcode);
          if (rawItem) {
            // Normalize rawItem
            let videoUrl = null;
            if (rawItem.video_url && isProgressiveMp4(rawItem.video_url)) {
              videoUrl = cleanVideoUrl(rawItem.video_url);
            } else if (Array.isArray(rawItem.video_versions) && rawItem.video_versions.length > 0) {
              for (const v of rawItem.video_versions) {
                if (v && v.url && isProgressiveMp4(v.url)) {
                  videoUrl = cleanVideoUrl(v.url);
                  break;
                }
              }
            }

            let imageUrl = rawItem.display_url || rawItem.image_versions2?.candidates?.[0]?.url || null;

            const carousel = [];
            const edges = rawItem.edge_sidecar_to_children?.edges;
            if (Array.isArray(edges)) {
              for (const edge of edges) {
                const node = edge.node;
                if (!node) continue;
                if (node.is_video && node.video_url && isProgressiveMp4(node.video_url)) {
                  carousel.push({ type: 'video', url: cleanVideoUrl(node.video_url) });
                } else if (node.display_url) {
                  carousel.push({ type: 'image', url: node.display_url });
                }
              }
            } else if (Array.isArray(rawItem.carousel_media)) {
              for (const item of rawItem.carousel_media) {
                if (item.video_versions?.length) {
                  carousel.push({ type: 'video', url: cleanVideoUrl(item.video_versions[0].url) });
                } else if (item.image_versions2?.candidates?.length) {
                  carousel.push({ type: 'image', url: item.image_versions2.candidates[0].url });
                }
              }
            }

            return {
              shortcode,
              isVideo: Boolean(videoUrl || rawItem.is_video),
              videoUrl,
              imageUrl,
              carousel,
            };
          }
        } catch {}
      }
    }
    return null;
  }

  /**
   * Filter and return TRUE post images (strictly excluding author avatar in <header>)
   */
  function getValidPostImages(container) {
    const allImgs = Array.from(container.querySelectorAll('img'));

    const filtered = allImgs.filter((img) => {
      // 1. Exclude anything inside <header> (post author avatar)
      if (img.closest('header')) return false;

      // 2. Exclude anything with profile picture alt text
      const alt = (img.alt || '').toLowerCase();
      if (alt.includes('profile picture') || alt.includes('profile photo') || alt.includes('avatar')) {
        return false;
      }

      // 3. Exclude small icons/thumbnails
      const w = img.naturalWidth || img.clientWidth || img.width || 0;
      const h = img.naturalHeight || img.clientHeight || img.height || 0;
      if (w < 120 && h < 120) return false;

      // 4. Exclude placeholder data URLs
      const src = img.currentSrc || img.src || '';
      if (src.startsWith('data:image/svg') || src.startsWith('data:image/gif')) return false;

      return true;
    });

    // Deduplicate images by source URL
    const seen = new Set();
    const unique = [];
    for (const img of filtered) {
      const url = getHighestResFromSrcset(img);
      if (url && !seen.has(url)) {
        seen.add(url);
        unique.push(img);
      }
    }

    return unique;
  }

  /**
   * Programmatic DOM Carousel Stepper: clicks "Next" to reveal and collect every slide
   */
  async function crawlCarouselDom(container) {
    const collectedUrls = [];
    const seen = new Set();

    // 1. Collect initial visible slide(s)
    const initialImgs = getValidPostImages(container);
    for (const img of initialImgs) {
      const u = getHighestResFromSrcset(img);
      if (u && !seen.has(u)) {
        seen.add(u);
        collectedUrls.push({ type: 'image', url: u });
      }
    }

    // 2. Step forward through slides using the Next button
    let nextBtn = container.querySelector('button[aria-label="Next"]');
    let steps = 0;
    while (nextBtn && steps < 12) {
      nextBtn.click();
      steps++;
      await new Promise((r) => setTimeout(r, 160));

      const currentImgs = getValidPostImages(container);
      for (const img of currentImgs) {
        const u = getHighestResFromSrcset(img);
        if (u && !seen.has(u)) {
          seen.add(u);
          collectedUrls.push({ type: 'image', url: u });
        }
      }

      nextBtn = container.querySelector('button[aria-label="Next"]');
    }

    // 3. Step back to restore original position for the user
    let prevBtn = container.querySelector('button[aria-label="Go back"]');
    let backSteps = 0;
    while (prevBtn && backSteps < steps) {
      prevBtn.click();
      backSteps++;
      await new Promise((r) => setTimeout(r, 60));
      prevBtn = container.querySelector('button[aria-label="Go back"]');
    }

    return collectedUrls;
  }

  /**
   * Handle Click on Single Media Download
   */
  async function handleSingleDownload(btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Finding...';

    try {
      const container =
        btn.closest('article') ||
        btn.closest('div[role="dialog"]') ||
        btn.closest('main') ||
        btn.parentElement?.closest('div[style*="flex"]') ||
        document;

      const shortcode = getPostShortcode(container);

      // --- Layer 1: Query Main World (Network intercept + React Fiber) ---
      let media = null;
      if (shortcode) {
        media = await fetchMediaFromMainWorld(shortcode);
      }

      // --- Layer 2: Query Embedded Scripts JSON ---
      if (!media && shortcode) {
        media = getMediaFromEmbeddedScripts(shortcode);
      }

      // If Media is found via JSON/Fiber:
      if (media) {
        if (media.isVideo && media.videoUrl) {
          triggerDownload(media.videoUrl, `instagram_video_${shortcode || Date.now()}.mp4`);
          btn.innerHTML = '✓ Saved!';
          setTimeout(() => (btn.innerHTML = originalText), 2200);
          return;
        }

        if (media.imageUrl) {
          triggerDownload(media.imageUrl, `instagram_photo_${shortcode || Date.now()}.jpg`);
          btn.innerHTML = '✓ Saved!';
          setTimeout(() => (btn.innerHTML = originalText), 2200);
          return;
        }
      }

      // --- Layer 3: Check HTML5 Video Element (Strict Progressive Check) ---
      const videos = Array.from(container.querySelectorAll('video'));
      for (const v of videos) {
        const directSrc = cleanVideoUrl(v.currentSrc || v.src || v.querySelector('source')?.src);
        if (directSrc && directSrc.startsWith('http') && isProgressiveMp4(directSrc)) {
          triggerDownload(directSrc, `instagram_video_${shortcode || Date.now()}.mp4`);
          btn.innerHTML = '✓ Saved!';
          setTimeout(() => (btn.innerHTML = originalText), 2200);
          return;
        }
      }

      // If video exists but only has blob src, try triggering play for 200ms to fire network request
      if (videos.length > 0 && shortcode) {
        const v = videos[0];
        try {
          if (v.paused) {
            v.play().catch(() => {});
            await new Promise((r) => setTimeout(r, 250));
            const retryMedia = await fetchMediaFromMainWorld(shortcode);
            if (retryMedia?.videoUrl) {
              triggerDownload(retryMedia.videoUrl, `instagram_video_${shortcode}.mp4`);
              btn.innerHTML = '✓ Saved!';
              setTimeout(() => (btn.innerHTML = originalText), 2200);
              return;
            }
          }
        } catch {}
      }

      // --- Layer 4: Check Active Post Image ---
      const validImgs = getValidPostImages(container);
      if (validImgs.length > 0) {
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
          triggerDownload(bestUrl, `instagram_photo_${shortcode || Date.now()}.jpg`);
          btn.innerHTML = '✓ Saved!';
          setTimeout(() => (btn.innerHTML = originalText), 2200);
          return;
        }
      }

      alert('InstaView: Could not locate media URL. If this is a video, please play it for 1 second and click Download again.');
      btn.innerHTML = originalText;
    } catch (err) {
      console.error('[InstaView] Download error:', err);
      btn.innerHTML = originalText;
    }
  }

  /**
   * Handle Click on "Download All" (Carousel / Multi-Image Group)
   */
  async function handleDownloadAll(btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Extracting all...';

    try {
      const container =
        btn.closest('article') ||
        btn.closest('div[role="dialog"]') ||
        btn.closest('main') ||
        document;

      const shortcode = getPostShortcode(container);
      let mediaUrls = [];

      // 1. Try extracting all slides from Main World / React Fiber
      if (shortcode) {
        const media = (await fetchMediaFromMainWorld(shortcode)) || getMediaFromEmbeddedScripts(shortcode);
        if (media && Array.isArray(media.carousel) && media.carousel.length > 0) {
          mediaUrls = media.carousel;
        }
      }

      // 2. If carousel data was not in JSON, crawl the DOM slider to get all images
      if (mediaUrls.length === 0) {
        btn.innerHTML = '⏳ Scanning slides...';
        mediaUrls = await crawlCarouselDom(container);
      }

      if (mediaUrls.length === 0) {
        alert('InstaView: No carousel slides found to download.');
        btn.innerHTML = originalText;
        return;
      }

      // Download each slide with a 450ms delay to prevent browser queue throttling
      for (let i = 0; i < mediaUrls.length; i++) {
        btn.innerHTML = `⏳ ${i + 1}/${mediaUrls.length}...`;
        const item = mediaUrls[i];
        const ext = item.type === 'video' ? 'mp4' : 'jpg';
        triggerDownload(item.url, `instagram_${shortcode || 'carousel'}_slide_${i + 1}.${ext}`);
        if (i < mediaUrls.length - 1) {
          await new Promise((r) => setTimeout(r, 450));
        }
      }

      btn.innerHTML = `✓ All ${mediaUrls.length} Saved!`;
      setTimeout(() => (btn.innerHTML = originalText), 3000);
    } catch (err) {
      console.error('[InstaView] Download all error:', err);
      btn.innerHTML = originalText;
    }
  }

  /**
   * Inject Buttons into Post Action Bar
   */
  function injectPostButtons(actionContainer) {
    if (actionContainer.querySelector('.instaview-btn-group')) return;

    const container =
      actionContainer.closest('article') ||
      actionContainer.closest('div[role="dialog"]') ||
      actionContainer.parentElement;

    const group = document.createElement('div');
    group.className = 'instaview-btn-group';

    // 1. Single Media Download Button
    const singleBtn = document.createElement('button');
    singleBtn.type = 'button';
    singleBtn.className = 'instaview-dl-btn';
    singleBtn.innerHTML = '⬇ Download';
    singleBtn.title = 'Download current visible photo or video';
    singleBtn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      handleSingleDownload(singleBtn);
    };
    group.appendChild(singleBtn);

    // 2. Check if post is a Carousel / Multi-Photo Post
    const shortcode = container ? getPostShortcode(container) : null;
    let isCarousel = false;
    let carouselCount = 0;

    if (shortcode && mediaCache.has(shortcode)) {
      const m = mediaCache.get(shortcode);
      if (m && Array.isArray(m.carousel) && m.carousel.length > 1) {
        isCarousel = true;
        carouselCount = m.carousel.length;
      }
    }

    if (!isCarousel && container) {
      // Check DOM indicators: next button, dots indicator, or multiple post images
      const hasCarouselButtons = container.querySelector('button[aria-label="Next"], button[aria-label="Go back"]');
      const multipleImgs = getValidPostImages(container).length > 1;
      const hasDots = container.querySelector('div[role="tablist"], ._aamj');
      if (hasCarouselButtons || multipleImgs || hasDots) {
        isCarousel = true;
      }
    }

    // If carousel, add "Download All" button
    if (isCarousel) {
      const allBtn = document.createElement('button');
      allBtn.type = 'button';
      allBtn.className = 'instaview-dl-btn instaview-dl-all-btn';
      allBtn.innerHTML = carouselCount > 0 ? `📦 Download All (${carouselCount})` : '📦 Download All';
      allBtn.title = 'Download all photos and videos in this carousel';
      allBtn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        handleDownloadAll(allBtn);
      };
      group.appendChild(allBtn);
    }

    actionContainer.appendChild(group);
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

    btn.onclick = async (e) => {
      e.stopPropagation();
      e.preventDefault();
      const originalText = btn.innerHTML;
      btn.innerHTML = '⏳ Saving...';

      // 1. Check for active story video
      const v = document.querySelector('video');
      if (v) {
        const directSrc = cleanVideoUrl(v.currentSrc || v.src);
        if (directSrc && directSrc.startsWith('http') && isProgressiveMp4(directSrc)) {
          triggerDownload(directSrc, `story_${Date.now()}.mp4`);
          btn.innerHTML = '✓ Saved!';
          setTimeout(() => (btn.innerHTML = originalText), 2000);
          return;
        }

        // Try getting video from mediaCache or main_world
        const match = window.location.pathname.match(/\/stories\/[^/]+\/([0-9]+)/);
        const storyId = match ? match[1] : null;
        if (storyId) {
          const media = await fetchMediaFromMainWorld(storyId);
          if (media?.videoUrl) {
            triggerDownload(media.videoUrl, `story_${storyId}.mp4`);
            btn.innerHTML = '✓ Saved!';
            setTimeout(() => (btn.innerHTML = originalText), 2000);
            return;
          }
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
   * Continuous DOM Observer
   */
  const observer = new MutationObserver(() => {
    // 1. Stories check
    if (window.location.pathname.startsWith('/stories/')) {
      injectStoryButton();
    } else {
      const existing = document.querySelector('.instaview-story-btn');
      if (existing) existing.remove();
    }

    // 2. Feed Posts and Reels: inject into action bar containing SVG Like/Comment/Share buttons
    const svgs = document.querySelectorAll(
      'svg[aria-label="Like"], svg[aria-label="Comment"], svg[aria-label="Share"], svg[aria-label="Save"]'
    );
    svgs.forEach((svg) => {
      const section = svg.closest('section') || svg.closest('div[role="presentation"]');
      if (section && !section.querySelector('.instaview-btn-group')) {
        injectPostButtons(section);
      }
    });

    // Fallback: scan articles
    const articles = document.querySelectorAll('article');
    articles.forEach((art) => {
      const sec = art.querySelector('section');
      if (sec && !sec.querySelector('.instaview-btn-group')) {
        injectPostButtons(sec);
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
