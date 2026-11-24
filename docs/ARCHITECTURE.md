# InstaView — System Architecture

## 1. High-Level Overview

**InstaView** (`https://ig-storyviewer.vercel.app`) is an anonymous, zero-footprint Instagram media viewer, downloader, and progressive web application (PWA), supplemented by an on-page Chrome Extension.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT TIER                               │
│  Next.js 16 (React 19) + PWA + Chrome Extension (MV3 Multi-World)      │
│  - 100% Local Privacy: Watchlist & Recent Searches (localStorage)      │
│  - Offline Story Vault: Blob & metadata storage (IndexedDB)            │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ HTTPS
┌────────────────────────────────────▼───────────────────────────────────┐
│                             NEXT.JS API                                │
│  /api/profile, /api/stories, /api/highlights, /api/posts, /api/reels   │
│  /api/media (Secure streaming proxy with SSRF & Private IP guards)     │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                       SERVICE & PROVIDER LAYER                         │
│  InstagramService (In-memory TTL cache + Provider Orchestration)       │
│  ├─ ScraperAPIProvider (Rotated Bearer tokens via TokenInterceptor)   │
│  ├─ DirectCrawlerProvider (SSR HTML / JSON public scraper)             │
│  └─ DemoProvider (Deterministic test suite & offline verification)     │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                       TOKEN POOL & INTERCEPTOR                         │
│  lib/instagram/token-pool.ts                                           │
│  - Zero hardcoding: reads SCRAPERAPI_TOKENS / SCRAPERAPI_TOKEN         │
│  - Dynamic regex token splitter, round-robin rotation & auto-failover  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
insta-view/
├── app/                           # Next.js 16 App Router
│   ├── api/                       # Edge-capable serverless endpoints
│   │   ├── profile/route.ts       # Profile header & privacy status
│   │   ├── stories/route.ts       # Active 24-hour stories
│   │   ├── highlights/route.ts    # Highlight albums & reel items
│   │   ├── posts/route.ts         # User feed posts & pagination
│   │   ├── reels/route.ts         # Clips / Reels feed
│   │   └── media/route.ts         # Streaming proxy & audio disposition
│   ├── [lang]/                    # i18n localized routes (10 languages)
│   ├── blog/                      # SEO guides & articles
│   ├── faq/                       # Structured FAQ with schema.org
│   └── layout.tsx                 # Root layout with meta tags & PWA manifest
├── components/                    # React 19 Client Components
│   ├── InstaViewer.tsx            # Main application orchestrator & navbar
│   ├── StoriesList.tsx            # 24h story grid, timer & batch ZIP
│   ├── StoriesViewer.tsx          # Full-screen story playback modal
│   ├── StoryVaultModal.tsx        # Offline "Watch Later" private vault
│   ├── PostsGrid.tsx              # Posts grid, ZIP exporter, caption copier
│   ├── ReelsGrid.tsx              # Reels grid, M4A audio extractor
│   ├── ProfileHeader.tsx          # Follower stats & Watchlist toggle
│   ├── TopAccountsDirectory.tsx   # Top 50 curated celebrity quick-selector
│   └── ThemeToggle.tsx            # Smooth Dark / Light mode switcher
├── extension/                     # Chrome Extension (Manifest V3)
│   ├── manifest.json              # Extension manifest declaring dual worlds
│   ├── main_world.js              # In-page fetch & React Fiber interceptor
│   ├── content.js                 # Isolated content script UI injector & crawler
│   ├── background.js              # Service worker downloads manager
│   ├── content.css                # Instagram on-page download buttons
│   └── popup.html                 # Extension status popup
├── lib/
│   ├── data/                      # FAQ, blog, and curated directory data
│   ├── i18n/                      # Translations across 10 locales
│   ├── instagram/                 # Provider abstraction, types, service
│   │   ├── providers/             # ScraperAPI, DirectCrawler, Demo providers
│   │   ├── token-pool.ts          # Centralized Token Interceptor
│   │   └── service.ts             # Service orchestrator & in-memory cache
│   ├── storage/                   # IndexedDB Story Vault client storage
│   └── utils/                     # URL parser, SSRF defense, site utilities
└── docs/                          # Architecture & developer documentation
```

---

## 3. Chrome Extension Multi-World Architecture

To bypass Instagram's segmented DASH video streaming (`0xC00D36C4` corruption) and unmounted carousel slides:

1. **`main_world.js` (`world: "MAIN"`, `document_start`)**:
   - Executes inside Instagram’s native JS context.
   - Intercepts `window.fetch` and `XMLHttpRequest` to capture raw GraphQL and Relay responses (`video_versions`, `edge_sidecar_to_children`).
   - Inspects `__reactFiber$` on DOM nodes when data is pre-rendered.
   - Dispatches parsed progressive MP4 and carousel payloads via `window.postMessage`.
2. **`content.js` (`world: "ISOLATED"`, `document_idle`)**:
   - Manages DOM injection for "⬇ Download" and "📦 Download All (N)" buttons.
   - Listens to messages from `main_world.js`.
   - Contains an **Automated DOM Slider Crawler** that programmatically clicks `button[aria-label="Next"]` if carousel data is not in memory.
   - Sends verified download requests to `background.js`.
