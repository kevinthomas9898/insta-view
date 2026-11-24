# Storage & Privacy Architecture

## 1. Privacy First: 100% Client-Side Persistence

InstaView is designed as a **stealth media viewer**. The server **never** stores user searches, watchlists, or media files.

| Data Type | Storage Engine | Scope & Retention |
| :--- | :--- | :--- |
| **Recent Searches** | `window.localStorage` | Client-only, max 8 items, instant delete / clear all |
| **Secret Watchlist** | `window.localStorage` | Client-only, encrypted profile snapshots |
| **Offline Story Vault** | `IndexedDB` (`instaview_story_vault`) | Client-only, holds base64/blob media and metadata |
| **Language & Theme** | `localStorage` + Cookies | Preferred language and Dark/Light mode preference |

---

## 2. Offline Story Vault (IndexedDB)

Instagram stories expire after 24 hours. The **Offline Story Vault** allows users to persist viewed stories locally on their device so they can watch or re-download them forever—even when offline or after Instagram deletes them.

### Database Schema
* **Database Name:** `instaview_db`
* **Object Store:** `story_vault`
* **Key Path:** `id` (e.g. `story_${username}_${storyId}`)
* **Indexes:** `username`, `savedAt`, `type`

```typescript
export interface VaultStoryItem {
  id: string;               // Unique story identifier
  username: string;         // Author Instagram username
  userAvatar?: string;      // Author profile picture
  mediaUrl: string;         // Cached media blob URL or CDN URL
  thumbnailUrl?: string;    // Story thumbnail
  type: 'image' | 'video';  // Media type
  takenAt: number;          // Original post timestamp
  savedAt: number;          // When user saved to local vault
  expiresAt: number;        // When story expired on Instagram (takenAt + 24h)
}
```

---

## 3. Data Protection Guarantees

1. **No Backend Databases:** InstaView runs entirely without a user database (no SQL, no Redis tracking).
2. **Zero Analytics on Profiles:** Target usernames queried by visitors are never logged or sold.
3. **No Cookies Sent to Instagram:** Web app media requests pass through `/api/media`, which strips user cookies and enforces strict SSRF protections against internal IP ranges.
