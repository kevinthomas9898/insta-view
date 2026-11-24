# InstaView Feature Guide & Specifications

## 1. Core Web App Features

### 📦 Batch "Download All Stories" (ZIP)
* **Location:** `StoriesList.tsx`
* **Functionality:** Bundles all 24-hour stories for the queried profile into a single `.zip` file using `jszip`. Each file is cleanly named (`story_1.mp4`, `story_2.jpg`, etc.).

### ⏳ Live Story Expiration Countdown
* **Location:** `StoriesList.tsx`
* **Functionality:** Real-time countdown clock displaying remaining time until each story is deleted by Instagram (`24h - (Date.now() - takenAt)`). Visual urgency indicators:
  * 🟢 **> 12h remaining:** Normal
  * 🟡 **2h - 12h remaining:** Caution
  * 🔴 **< 2h remaining:** Expiring soon!

### 💾 Offline "Watch Later" Story Vault
* **Location:** `StoryVaultModal.tsx` & `lib/storage/story-vault.ts`
* **Functionality:** 1-click `📌 Save to Vault` stores stories inside the browser's `IndexedDB`. Allows playback and downloads forever even after Instagram removes the story.

### ⭐ "Top 50 Most Viewed" Quick Directory
* **Location:** `TopAccountsDirectory.tsx`
* **Functionality:** Curated directory with instant 1-click search for celebrities, athletes, musicians, and creators across categories (Trending, Sports, Music, Entertainment, Tech).

### 🔍 Smart Instagram URL Paste Detector
* **Location:** `lib/utils/instagram-url.ts`
* **Functionality:** Automatically parses pasted links like `https://instagram.com/reel/C8Zq...` or `https://instagram.com/stories/username/123` into clean usernames and switches to the relevant tab.

### 🎵 Reel Audio Extractor (M4A)
* **Location:** `ReelsGrid.tsx` & `/api/media?audioOnly=true`
* **Functionality:** Extracts the audio track from any reel as a standalone M4A audio file.

---

## 2. Chrome Extension Features

* **Multi-World Interceptor (`main_world.js`):** Intercepts native GraphQL & React Fiber to capture 1080p progressive MP4 streams and all carousel images.
* **Corrupt Video Fix (`0xC00D36C4`):** Strictly rejects segmented DASH chunks in favor of complete progressive streams.
* **Automated Carousel Crawler:** Walks the slider forward to collect 100% of unmounted carousel slides before batch-downloading.
