# Anonymous Public Instagram Media Viewer — Backend First

A high-performance, modular Next.js and TypeScript application for anonymously querying and viewing public Instagram profiles, stories, highlights, posts, and reels, complete with native video playback, carousel navigation, and direct media streaming/downloads.

Built with a **Backend-First, Provider-Agnostic Architecture**, separating data ingestion, normalization, proxying, and caching from the presentation layer.

---

## 1. Technical Feasibility & Research Summary

### How Existing Anonymous Viewers Work (AnonyIG, FastDL, Snapinsta)
Services like AnonyIG, FastDL, and Snapinsta do not query Instagram directly from user browsers, nor do they use the official Meta Graph API (which restricts access solely to owned Business/Creator accounts and forbids arbitrary public scraping). Instead, they operate via:
1. **Server-Side Reverse Engineering:** Requests are routed server-side, stripping user identifiers so the user never triggers a "view" event on Instagram's story tray.
2. **Rotating Residential & Mobile Proxy Pools:** Instagram blocks unauthenticated datacenter/server IPs with immediate `429 Too Many Requests` or `LoginRequired` walls. Anonymous viewers route requests through residential IPs to query private mobile endpoints (`/api/v1/feed/reels_media/`, etc.).
3. **Direct CDN Extraction & Referer Decoupling:** Video and photo files reside on Meta CDNs (`scontent.cdninstagram.com`, `*.fbcdn.net`). Because Meta CDNs restrict cross-origin hotlinking by inspecting the `Referer` header, viewers proxy or strip referrers to enable streaming and downloading.

### Comparison of Retrieval Approaches

| Approach | Profile Data | Stories & Highlights | Posts & Reels | Rate Limits | Estimated Cost | Production Viability |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Official Meta Graph API** | Only Own Account | Only Own Stories | Only Own Posts | 200 req/hr/user | Free (Requires Business App) | **Not Viable** for arbitrary public viewers |
| **Direct Web SSR Crawler** *(Included)* | **Yes** (Bio, Stats, HD Avatar) | No (Blocked by login wall) | Limited | High if unthrottled | **$0.00** (Zero external dependencies) | **Viable for Profiles** |
| **RapidAPI / Managed Scrapers** *(Included)* | **Yes** | **Yes** | **Yes** | Provider Plan dependent | **$10 – $30/mo** (5k-20k requests) | **Highly Viable & Stable** |
| **Puppeteer / Headless Browsers** | Yes | Yes (Session required) | Yes | Heavy RAM/CPU footprint | Server resources ($20-$50/mo) | Fragile, easily detected |

---

## 2. Architecture & Design Patterns

```
insta-view/
├── app/
│   ├── api/
│   │   ├── profile/route.ts      # GET /api/profile?username=...
│   │   ├── stories/route.ts      # GET /api/stories?username=...
│   │   ├── highlights/route.ts   # GET /api/highlights?username=...
│   │   ├── posts/route.ts        # GET /api/posts?username=...
│   │   ├── reels/route.ts        # GET /api/reels?username=...
│   │   └── media/route.ts        # GET /api/media?url=...&download=... (SSRF safe & streaming)
│   ├── page.tsx                  # Minimal utilitarian testing interface
│   └── layout.tsx
├── components/
│   ├── ProfileHeader.tsx         # Profile avatar, statistics, bio, demo notices
│   ├── TabsNav.tsx               # Tab switching (Stories, Highlights, Posts, Reels)
│   ├── StoriesViewer.tsx         # Functional modal with progress bars, video/image, seek, download
│   ├── StoriesList.tsx           # Active 24-hour stories grid
│   ├── HighlightsViewer.tsx      # Highlights cover grid with nested stories browser
│   ├── PostsGrid.tsx             # Post gallery with multi-slide carousel navigator
│   └── ReelsGrid.tsx             # Vertical 9:16 reels grid with native HTML5 video player
├── lib/
│   ├── instagram/
│   │   ├── types/                # Standardized TypeScript data models (MediaItem, Profile, etc.)
│   │   ├── errors/               # Standardized error hierarchy (InstagramError, ErrorCodes)
│   │   ├── providers/
│   │   │   ├── provider.interface.ts # Pluggable InstagramProvider abstraction
│   │   │   ├── direct-crawler.provider.ts # Live direct public SSR engine ($0 keyless)
│   │   │   ├── rapidapi.provider.ts      # Scalable RapidAPI scraper integration
│   │   │   ├── demo.provider.ts          # Deterministic testing provider with real media streams
│   │   │   └── factory.ts                # Dynamic provider selection factory
│   │   └── services/
│   │       └── instagram.service.ts      # Business logic, caching, download URL generation
│   ├── cache/                    # High-speed in-memory TTL caching
│   ├── rate-limit/               # Sliding window rate limiter (30 req/min/IP)
│   ├── validation/               # Zod schemas for query and username validation
│   └── utils/                    # SSRF prevention and secret-safe logging
└── scripts/
    ├── test-providers.ts         # Automated unit test suite (30 assertions)
    └── test-http.ts              # End-to-end HTTP integration test suite (15 assertions)
```

---

## 3. Installation & Development Setup

### Prerequisites
- Node.js `v20.0.0` or higher (Tested on Node `v24.14.0`)
- npm `v10+`

### Quick Start

1. Clone or navigate to the repository directory:
   ```bash
   cd "d:/Kevin/Projects/Personal Projects/insta-view"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment configuration:
   ```bash
   cp .env.example .env.local
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Environment Variables Configuration

Create `.env.local` to configure operational parameters:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `INSTAGRAM_PROVIDER` | `crawler` | Default provider engine (`crawler`, `rapidapi`, or `demo`). |
| `INSTAGRAM_RAPIDAPI_KEY` | *(empty)* | Optional. RapidAPI key for full stories/highlights/reels proxy access. |
| `INSTAGRAM_RAPIDAPI_HOST` | `instagram-scraper-api2.p.rapidapi.com` | RapidAPI host endpoint. |
| `CACHE_TTL_PROFILE` | `600` | Profile metadata cache duration in seconds (10 minutes). |
| `CACHE_TTL_STORIES` | `180` | Stories cache duration in seconds (3 minutes, time-sensitive). |
| `CACHE_TTL_POSTS` | `900` | Posts cache duration in seconds (15 minutes). |
| `CACHE_TTL_REELS` | `900` | Reels cache duration in seconds (15 minutes). |
| `CACHE_TTL_HIGHLIGHTS` | `900` | Highlights cache duration in seconds (15 minutes). |
| `DEBUG` | `false` | Enable verbose backend console logging. |

---

## 5. Providers & Retrieval Modes

### 1. Built-in Direct Crawler Provider (`crawler`)
- **Cost:** $0.00 (No API key required)
- **Features Supported:** Live public profile information (HD profile picture, bio, verified status, follower/following/posts counts, user ID).
- **Behavior:** Queries Instagram's Server-Side Rendered (SSR) public interface using verified crawler headers. Because Instagram requires session cookies for unauthenticated web stories, story endpoints return an informative `UNSUPPORTED_FEATURE` code with instructions to use an API key or demo mode.

### 2. RapidAPI Scraper Provider (`rapidapi`)
- **Cost:** Freemium ($0 for 50-100 requests; $10-$30/month for 5,000 to 20,000 requests)
- **Where to obtain key:** [RapidAPI Instagram Scraper API](https://rapidapi.com/)
- **Features Supported:** Full live Profile, 24-hour Stories, Highlights with nested items, Timeline Posts (images, videos, carousels), and Reels with audio details.

### 3. Demo Provider (`demo`)
- **Activated via:** Header switch in UI, `?demo=true` query parameter, or `INSTAGRAM_PROVIDER=demo`.
- **Purpose:** Reliable testing of UI components, native HTML5 video playback, seeking, volume controls, multi-slide carousels, and real media file downloads using verified CC0 CDN media without consuming API quota.
- **Labeling:** Explicitly marked with `DEMO DATA — NOT LIVE INSTAGRAM DATA` in headers and metadata.

---

## 6. Standardized API Endpoints

All endpoints return a uniform JSON format:

```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "provider": "DirectCrawler (Built-in SSR Engine)",
    "executionTimeMs": 142,
    "isDemo": false,
    "timestamp": "2026-11-23T11:00:00.000Z"
  }
}
```

On error:
```json
{
  "success": false,
  "error": {
    "code": "PROFILE_NOT_FOUND",
    "message": "User @nonexistent does not exist or was deleted"
  }
}
```

### Endpoints Reference
- `GET /api/profile?username={username}&demo={true|false}`: Returns profile metadata, counts, biography, and avatar.
- `GET /api/stories?username={username}&demo={true|false}`: Returns active 24-hour stories with timestamps, durations, and media URLs.
- `GET /api/highlights?username={username}&demo={true|false}`: Returns highlight albums with cover photos and nested media items.
- `GET /api/posts?username={username}&demo={true|false}`: Returns recent timeline posts, including single images, videos, and multi-slide carousels.
- `GET /api/reels?username={username}&demo={true|false}`: Returns vertical reel videos, play counts, and audio information.
- `GET /api/media?url={url}&download={true|false}&filename={filename}`:
  - **Streaming:** Proxies upstream CDN media, passes `Range: bytes=...` requests, and forwards `206 Partial Content` for video seeking.
  - **Hotlink Protection Bypass:** Handles upstream referrer restrictions so Meta CDN assets load seamlessly.
  - **One-Click Download:** Attaches `Content-Disposition: attachment; filename="..."` with verified MIME types.
  - **SSRF Defense:** Rejects local loopback, RFC 1918 private subnets, cloud metadata IPs (`169.254.169.254`), and unauthorized hosts with `403 Forbidden`.

---

## 7. Testing Suite

The repository includes comprehensive automated test suites:

### Unit & Provider Test Suite
```bash
npm test
```
*Validates 30 assertions across live crawler extraction, demo datasets, caching layer (0ms hits), and SSRF URL validation.*

### End-to-End HTTP Integration Test Suite
```bash
npm run test:http
```
*Spawns the Next.js server on a test port, executes live HTTP requests against all 6 API endpoints, validates HTTP 200/206/400/403 status codes, verifies video byte-range streaming, and checks download headers.*

---

## 8. Limitations & Platform Boundaries

1. **Private Accounts:** Private profiles cannot be viewed or downloaded. The API strictly identifies private accounts and returns `PRIVATE_ACCOUNT`.
2. **Access Controls:** This application does not bypass authentication, steal cookies, or store Instagram user credentials.
3. **Story Expiration:** Instagram automatically purges active stories after 24 hours.
4. **Direct IP Rate Limiting:** When using the direct crawler without a rotating proxy, Meta may throttle queries from datacenter IP addresses (returning `429 Too Many Requests`). For high-volume production deployments, configure `INSTAGRAM_RAPIDAPI_KEY` or a residential proxy pool.

---

## 9. Deployment Instructions

### Option 1: Vercel (Recommended)
1. Push this repository to GitHub or GitLab.
2. Import the project into Vercel.
3. Under **Project Settings > Environment Variables**, add:
   - `INSTAGRAM_PROVIDER`: `crawler` (or `rapidapi`)
   - `INSTAGRAM_RAPIDAPI_KEY`: your RapidAPI key (if using RapidAPI)
4. Deploy.

### Option 2: Docker / Node.js Production Server
1. Build the production application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```
   The application listens on port `3000` (or `PORT` environment variable).
