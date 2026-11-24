/**
 * InstaView - Main World Interceptor
 * Runs in the page's execution context (world: "MAIN") on instagram.com.
 * 
 * Capabilities:
 * 1. Hooks window.fetch and XMLHttpRequest to passively capture pristine progressive MP4 video streams
 *    and multi-slide carousel data directly from Instagram's native GraphQL & REST APIs.
 * 2. Traverses React Fiber internals (__reactFiber$...) on DOM elements to extract full uncompressed media
 *    for server-rendered or pre-cached posts.
 * 3. Bridges all captured media to the extension content script via window.postMessage.
 */

(function () {
  'use strict';

  if (window.__instaview_main_installed) return;
  window.__instaview_main_installed = true;

  const mediaCache = new Map();

  /**
   * Check if a video URL is a true progressive MP4 (and not a DASH/audio init fragment)
   */
  function isValidProgressiveVideoUrl(url) {
    if (!url || typeof url !== 'string') return false;
    // Reject DASH init fragments or audio-only chunks that trigger 0xC00D36C4
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
  function cleanUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return null;
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
   * Extract standardized media payload from any Instagram media object
   * (Supports GraphQL schema, Mobile REST schema, and Relay structures)
   */
  function extractMediaItem(item) {
    if (!item || typeof item !== 'object') return null;

    const shortcode = item.code || item.shortcode || item.id;
    if (!shortcode) return null;

    let isVideo = Boolean(item.is_video || item.video_duration || item.video_versions);
    let videoUrl = null;
    let imageUrl = null;
    const carousel = [];

    // 1. Extract Video Stream
    if (item.video_url && isValidProgressiveVideoUrl(item.video_url)) {
      videoUrl = cleanUrl(item.video_url);
      isVideo = true;
    } else if (Array.isArray(item.video_versions) && item.video_versions.length > 0) {
      // Pick highest bitrate progressive MP4
      for (const v of item.video_versions) {
        if (v && v.url && isValidProgressiveVideoUrl(v.url)) {
          videoUrl = cleanUrl(v.url);
          isVideo = true;
          break;
        }
      }
    } else if (Array.isArray(item.video_resources) && item.video_resources.length > 0) {
      const last = item.video_resources[item.video_resources.length - 1];
      if (last && last.src && isValidProgressiveVideoUrl(last.src)) {
        videoUrl = cleanUrl(last.src);
        isVideo = true;
      }
    }

    // 2. Extract Photo URL
    if (item.display_url) {
      imageUrl = item.display_url;
    } else if (Array.isArray(item.display_resources) && item.display_resources.length > 0) {
      imageUrl = item.display_resources[item.display_resources.length - 1]?.src;
    } else if (item.image_versions2?.candidates?.length) {
      imageUrl = item.image_versions2.candidates[0]?.url;
    }

    // 3. Extract Carousel Slides (GraphQL edge_sidecar_to_children format)
    const edges = item.edge_sidecar_to_children?.edges;
    if (Array.isArray(edges) && edges.length > 0) {
      for (const edge of edges) {
        const node = edge.node;
        if (!node) continue;

        if (node.is_video && node.video_url && isValidProgressiveVideoUrl(node.video_url)) {
          carousel.push({ type: 'video', url: cleanUrl(node.video_url) });
        } else if (node.display_url) {
          carousel.push({ type: 'image', url: node.display_url });
        } else if (node.display_resources?.length) {
          carousel.push({
            type: 'image',
            url: node.display_resources[node.display_resources.length - 1].src,
          });
        }
      }
    }
    // Extract Carousel Slides (REST carousel_media format)
    else if (Array.isArray(item.carousel_media) && item.carousel_media.length > 0) {
      for (const slide of item.carousel_media) {
        if (slide.video_versions?.length) {
          for (const v of slide.video_versions) {
            if (v && v.url && isValidProgressiveVideoUrl(v.url)) {
              carousel.push({ type: 'video', url: cleanUrl(v.url) });
              break;
            }
          }
        } else if (slide.image_versions2?.candidates?.length) {
          carousel.push({ type: 'image', url: slide.image_versions2.candidates[0].url });
        }
      }
    }

    if (!videoUrl && !imageUrl && carousel.length === 0) {
      return null;
    }

    return {
      shortcode: String(shortcode),
      isVideo,
      videoUrl,
      imageUrl,
      carousel,
    };
  }

  /**
   * Recursively traverse any JSON tree to extract all post media objects
   */
  function harvestMediaFromTree(obj, depth = 0) {
    if (!obj || depth > 12) return;

    if (Array.isArray(obj)) {
      for (const child of obj) {
        harvestMediaFromTree(child, depth + 1);
      }
      return;
    }

    if (typeof obj === 'object') {
      const media = extractMediaItem(obj);
      if (media && media.shortcode) {
        const existing = mediaCache.get(media.shortcode);
        // Merge or store if richer
        if (!existing || (!existing.videoUrl && media.videoUrl) || (existing.carousel.length < media.carousel.length)) {
          mediaCache.set(media.shortcode, media);
          window.postMessage(
            {
              type: 'INSTAVIEW_MEDIA_INTERCEPT',
              media,
            },
            '*'
          );
        }
      }

      for (const key of Object.keys(obj)) {
        if (obj[key] && typeof obj[key] === 'object') {
          harvestMediaFromTree(obj[key], depth + 1);
        }
      }
    }
  }

  // --- 1. Hook window.fetch ---
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);
    try {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
      if (
        url.includes('/graphql/query') ||
        url.includes('/api/v1/') ||
        url.includes('clips') ||
        url.includes('media') ||
        url.includes('timeline')
      ) {
        response
          .clone()
          .json()
          .then((data) => {
            harvestMediaFromTree(data);
          })
          .catch(() => {});
      }
    } catch {}
    return response;
  };

  // --- 2. Hook XMLHttpRequest ---
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  const originalXhrSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this._instaViewUrl = url;
    return originalXhrOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function (...rest) {
    this.addEventListener('load', function () {
      try {
        const url = this._instaViewUrl || '';
        if (
          url.includes('/graphql/query') ||
          url.includes('/api/v1/') ||
          url.includes('clips') ||
          url.includes('media') ||
          url.includes('timeline')
        ) {
          const data = JSON.parse(this.responseText);
          harvestMediaFromTree(data);
        }
      } catch {}
    });
    return originalXhrSend.apply(this, rest);
  };

  // --- 3. React Fiber Traversal on demand ---
  function inspectFiberForShortcode(shortcode) {
    // Look for article or dialog with links matching shortcode
    const targets = Array.from(document.querySelectorAll('article, div[role="dialog"], main'));
    for (const el of targets) {
      const html = el.innerHTML || '';
      if (html.includes(shortcode)) {
        const fiberKey = Object.keys(el).find(
          (k) => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$')
        );
        if (fiberKey && el[fiberKey]) {
          let curr = el[fiberKey];
          let depth = 0;
          while (curr && depth < 25) {
            const props = curr.memoizedProps || curr.pendingProps;
            if (props) {
              const candidate = props.post || props.item || props.media || props.clip;
              if (candidate) {
                const media = extractMediaItem(candidate);
                if (media) return media;
              }
            }
            curr = curr.return;
            depth++;
          }
        }
      }
    }
    return null;
  }

  // --- 4. Listen for query requests from Isolated World ---
  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data) return;

    if (event.data.type === 'INSTAVIEW_GET_MEDIA') {
      const shortcode = event.data.shortcode;
      let media = mediaCache.get(shortcode);

      if (!media && shortcode) {
        media = inspectFiberForShortcode(shortcode);
        if (media) {
          mediaCache.set(shortcode, media);
        }
      }

      window.postMessage(
        {
          type: 'INSTAVIEW_MEDIA_RESPONSE',
          requestId: event.data.requestId,
          shortcode,
          media: media || null,
        },
        '*'
      );
    }
  });

  console.log('[InstaView] Main world interceptor active.');
})();
