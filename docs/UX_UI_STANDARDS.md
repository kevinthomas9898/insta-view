# InstaView UX / UI Design Standards & System Rules

> **Status:** Active & Enforced  
> **Target Platform:** Mobile, Tablet & Desktop Web (Responsive Next.js & Tailwind CSS)  
> **Philosophy:** Stealth-first, zero-clutter, native Instagram feel, and 100% viewport-centered modal architecture.

---

## 1. Modal & Viewport Standards (Strict Viewport Rule)

### The Problem
Previously, secondary interfaces (such as the Watchlist or Vault) were conditionally rendered inline inside page containers (e.g. inside `<section className="hero">`). This pushed content down, broke scroll position, and caused dialogs to appear far below the user's viewport—making them virtually invisible on mobile and desktop without manual scrolling.

### The Standard
All interactive modal dialogs (Watchlist, Story Vault, Media Fullscreen Viewers, Install Prompts) **MUST** strictly adhere to the **Centered Viewport Pattern**:

```tsx
// Standard Modal Container Pattern
<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
  {/* Backdrop click to dismiss */}
  <div className="absolute inset-0" onClick={onClose} />

  {/* Centered Modal Card */}
  <div 
    className="relative w-full max-w-xl max-h-[85vh] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Header, Scrollable Body, and Footer */}
  </div>
</div>
```

### Mandatory Requirements for All Modals
1. **`fixed inset-0 z-50`:** Must occupy the fixed screen viewport, never pushing parent DOM layout or shifting page elements.
2. **Backdrop Blur & Dark Overlay:** `bg-black/80 backdrop-blur-md` to maintain stealth immersion and contrast against page content.
3. **Double Dismiss Controls:**
   - Explicit `X` close icon in the top-right header with minimum `p-1.5` touch padding.
   - Click outside the dialog card (on backdrop) immediately triggers `onClose()`.
   - `Escape` keyboard listener attached on mount and cleaned up on unmount:
     ```tsx
     useEffect(() => {
       const handleKeyDown = (e: KeyboardEvent) => {
         if (e.key === 'Escape') onClose();
       };
       if (isOpen) window.addEventListener('keydown', handleKeyDown);
       return () => window.removeEventListener('keydown', handleKeyDown);
     }, [isOpen, onClose]);
     ```
4. **Body Scroll Lock:** Dialog content has its own internal scroll (`overflow-y-auto max-h-[85vh]`).
5. **Single-Line Header Rule (No Mobile Truncation or Wrapping):**
   - Modal titles must be concise (e.g., `Watchlist`, `Story Vault`) and styled with `whitespace-nowrap` so titles never truncate into awkward ellipses (e.g., `Story Va...`).
   - Header left flex container must remain minimal: `[Icon] Title [Count] (i)`. Never stuff text badges (`INFO`) into the mobile title line.
6. **Privacy Reassurance & In-Modal Info Banner Pattern (`(i)` Button):**
   - **Never** render multi-line explanatory paragraphs directly in mobile modal headers.
   - **Never** use absolute floating tooltips that can overflow the right edge of small mobile viewports (≤ 380px) or get clipped by modal `overflow-hidden`.
   - **Theme Consistency:** In-modal privacy banners must use theme-adaptive emerald glass styling (`bg-emerald-500/10 border border-emerald-500/25` with `dark:text-zinc-300`). Never hardcode bright light-mode white backgrounds (`bg-slate-50`) that jar with dark mode.
   - Privacy guarantees are toggled via a compact circular `(i)` button in the header. When opened, it reveals an in-flow responsive banner with an `(X)` dismiss button that saves the dismissed state in `localStorage`.

---

## 2. Zero-Clutter Layout & Information Hierarchy

### Purity of the Hero Search Section
- **One Goal:** The hero section exists exclusively to let the user enter an Instagram username or URL and search.
- **Forbidden in Hero:**
  - No massive directory grids inside the search card.
  - No duplicate "Popular suggestions" rows when a directory or recent search chips are present.
  - No banners, ads, or promotional drawers.
- **Allowed in Hero:**
  - Brand heading & value proposition.
  - Search input with `@` prefix and vibrant gradient CTA.
  - Subtle `Recent: @username` chips with 1-click removal (`X`).

### Contextual Visibility (Discovery vs. Active Profile)
- When a user lands on the site (`!profile`):
  - Hero search is prominent.
  - **"Top 50 Most Viewed Accounts"** is rendered **outside** the search card as its own dedicated discovery section below the hero, featuring collapsible controls, category filters (`Trending`, `Sports`, `Music`, `Cinema`, `Creators`), and follower badges.
  - **Mobile Clutter Prevention Rule:** On mobile screens (`< 768px`), the directory **MUST default to collapsed**, displaying a sleek 44px 1-line bar (`🔥 Top 50 Most Viewed Accounts [Explore ▾]`). This saves over 350px of vertical space and prevents an overwhelming wall of pill buttons from dominating mobile viewports. On desktop (`≥ 768px`), it automatically expands.
- When a user views an active profile (`profile !== null`):
  - **All directory widgets, promotional grids, and discovery carousels are completely hidden.**
  - 100% of the screen is dedicated to the creator's profile header, active tab navigation, and requested media.

---

## 3. Non-Intrusive, Native Instagram Monetization

### Strictly Prohibited Placements
- **NO Static Ads on Homepages:** The home page must remain pristine and trustworthy.
- **NO Ads Between Profile Header and Tabs:** Never visually sever the account header (`@username`, bio, followers) from their media tabs (`Stories`, `Highlights`, `Posts`, `Reels`).
- **NO Flashing Skyscraper Sidebars:** Fixed sidebars on wide screens distract from media consumption and violate clean UI standards.

### Approved Native Placements (Instagram Parity)
1. **In-Feed Posts Grid (`PostsGrid.tsx`):**
   - Ads appear natively inserted between posts (every 6 items), matching Instagram's native feed algorithm.
   - **Responsive Unit Standard:** On PC/desktop (wide screen), up to 4 ad units display in a clean horizontal row. On mobile (< 640px), the ad is strictly restricted to **1 single ad card** via CSS and JS clipping to avoid 4 vertically stacked ads overwhelming the mobile feed.
2. **In-Feed Reels Grid (`ReelsGrid.tsx`):**
   - Ads appear natively inserted between reels (every 6 items).
   - Follows the same responsive 1-ad on mobile rule.
3. **Instagram-Style Story Interstitial (`StoriesViewer.tsx`):**
   - While viewing full-screen stories, a sponsored interstitial appears every 3 stories.
   - Includes a **compulsory 3-second countdown** (`⏳ Skip in 3s` &rarr; `Skip Ad ⏭️`) to ensure advertiser impressions while respecting user experience.
   - Clean "Learn More ↗" call-to-action button matching Instagram's sponsored swipe-up format.

---

## 4. Offline Story Vault & Local Watchlist UX

### Clear Call-to-Actions for Saving Media
- **On Story Cards (`StoriesList.tsx`):**
  - Explicit action button: `[📌 Vault]` (or `[✓ Saved]` once stored).
  - Clear visual feedback with color transition (neutral black/white → amber/gold).
- **In Full-Screen Story Viewer (`StoriesViewer.tsx`):**
  - Bottom action bar includes `[📌 Save to Vault]` next to the download button.
  - Tapping saves the story directly into client-side IndexedDB with zero server transmission.
- **Empty State Guidance (`StoryVaultModal.tsx` & `WatchlistModal.tsx`):**
  - When empty, modals display a numbered 3-step illustrated guide explaining exactly how to bookmark or vault stories.

### Media Resilience & Zero-Black-Box Rule
- **The Problem:** In Chromium and WebKit mobile browsers, rendering a paused `<video preload="metadata">` without an explicit `poster` or `autoplay` renders a 100% solid pitch-black rectangle.
- **Mandatory Video Preview Standards:**
  1. **Autoplay Loop Preview:** Muted inline video preview tags must use `autoPlay muted loop playsInline preload="auto"`.
  2. **Timestamp Offset Fallback:** Video source URLs must append `#t=0.001` so that decoder engines seek to frame 0 immediately.
  3. **Layered Gradient Fallback:** Every media card must contain a layered background with avatar initials and `@username` so users never see a black void during network fetching or buffering.
  4. **Glassmorphic Play Affordance:** Video cards must feature a centered glassmorphic Play badge (`fill-white`) so users intuitively understand that the card is playable.

---

## 5. Mobile Responsiveness & Touch Targets

1. **Touch Targets:** Minimum 44px &times; 44px clickable area for all mobile buttons, tabs, and interactive pills.
2. **Horizontal Overflow Protection:**
   - Tabs and directory categories must use `overflow-x-auto scrollbar-none` with smooth horizontal touch momentum.
   - Media cards must respect `aspect-[9/16]` for stories/reels and `aspect-square` for photo posts.
3. **Safe-Area Insets:** Ensure all fixed navigation bars and bottom players account for mobile browser navigation chrome and notches (`pb-safe`).

---

## 6. Non-Obstructing Media Viewer Standard

### Problem Statement
In media viewers, placing large action buttons (such as Download, Download All ZIP, direct link buttons) and multiline captions directly on top of the media (`absolute bottom-0 inset-x-0`) covers up to 40% of the image or video on mobile displays, hiding clothing, jewelry, faces, subtitles, and video content.

### Mandatory Viewer Standards
1. **Separation of Media and Controls on Mobile (`PostsGrid.tsx`):**
   - Media stage is contained in `flex-1 min-h-0 bg-black flex items-center justify-center overflow-hidden`.
   - The mobile details panel (`md:hidden`) is situated **below** the media stage in the modal's vertical flex layout (`shrink-0 bg-zinc-950 border-t border-zinc-800/80 px-3.5 py-2.5`).
   - The media scales with `object-contain` within the upper stage with **zero visual overlap** from buttons, captions, or icons.
2. **Clean View (Distraction-Free Fullscreen Mode):**
   - Every viewer (`PostsGrid.tsx`, `ReelsGrid.tsx`, `StoriesViewer.tsx`) must provide a Clean View toggle (`Eye` / `EyeOff` icon in the top header).
   - In Posts viewer, tapping on the photo directly toggles Clean View on/off.
   - When Clean View is active:
     - The bottom details panel / overlay is hidden.
     - Media scales to 100% of the modal viewport height.
     - A discreet floating pill (`[👁️ Show Details]`) appears at the bottom with 1-tap restoration.
3. **Reels Vertical Clearance & Instagram Parity (`ReelsGrid.tsx`):**
   - **Bottom-Edge Progress Bar:** The timeline scrub bar sits at the absolute bottom edge (`bottom-0 inset-x-0 h-1 sm:h-1.5`), flush with the container boundary. It must NEVER float in the middle of the video.
   - **Right-Side Action Rail:** Action buttons (`Video` download, `Audio` download, `Copy` caption, `Direct` link) are stacked vertically along the right edge (`right-3 bottom-6`), mirroring Instagram's native Reels layout. No horizontal shelves of buttons are permitted across the video bottom.
   - **Unobtrusive Bottom-Left Information:** Creator handle, audio ticker, and 1-line expandable caption sit at the bottom-left with `max-w-[75%]`, leaving the video center 100% visible and unblocked.
   - 9:16 vertical reels also feature the Clean View toggle (`Eye` icon in top bar) to hide all overlays on demand.
4. **Stories Viewer Consistency (`StoriesViewer.tsx`):**
   - Top header includes the Clean View toggle, allowing full unobstructed story viewing without the bottom action pills.

