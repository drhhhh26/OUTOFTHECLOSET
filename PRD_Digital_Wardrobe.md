# PRD — Digital Wardrobe (Zara-inspired)

**Version:** 0.1 (MVP)
**Status:** Draft for discussion
**Author:** Dolev

---

## 1. TL;DR

A personal website that displays the clothes already in my closet, with a visual experience that feels like a premium fashion site in the style of Zara — but **no store, no checkout, and no public uploads**. Items live in a closed dataset that I (as the owner) populate and manage. The goal: to see, filter, and get dressed from what I already own, in a clean and beautiful presentation.

---

## 2. Problem & Goal

**Problem:** Existing clothing lists (Google Sheets, closet apps) feel like inventory management — they aren't inspiring and aren't pleasant to use.

**Goal:** Give my clothes a fashion-site-level presentation — so browsing my closet feels like browsing a collection.

---

## 3. Goals & Non-goals

**Goals (In scope):**
- Clean grid view of all clothing items, with a large image per item
- A single-item screen with details (category, color, brand, tags)
- Basic filtering and search (category / color / season)
- Internal management interface to add items (closed dataset)

**Non-goals (Out of scope) — at least for the MVP:**
- No e-commerce, cart, or payment
- No uploads by external users / no public sign-up
- No AI recommendations / automatic "outfit building" (possible later)
- No native mobile app (though the design is responsive)

---

## 4. Target User

A single user / a small, closed set of users (me + possibly household members). No public audience.

---

## 5. Design Principles (Zara language)

- **Extreme minimalism:** white background, lots of "air," almost no divider lines
- **The image is the hero:** items in a large portrait format on a uniform background
- **Typography:** thin, elegant serif/sans-serif, large letters in headings, generous letter spacing
- **Grid:** 2–4 columns depending on screen width, uniform spacing
- **Color:** black-and-white by default; color comes from the clothes themselves
- **Quiet interaction:** subtle hover, smooth transitions, no "noise"

---

## 6. Main Screens (MVP)

### 6.1 Home — Catalog Grid
- Minimal header at top (logo/name only)
- Thin filter bar: category · color · season · search
- Grid of large images; below each image: item name + brand only
- Tapping an item → single-item screen

### 6.2 Single-item Screen
- Large image (multiple images / gallery supported)
- Details: name, category, color, brand, season, tags
- Free-text notes field (e.g., "goes well with...", "wear less often")
- Buttons: Edit · Back

### 6.3 Management / Entry Screen (internal)
- Add-item form: image upload, fill fields, save
- Edit/delete an existing item

---

## 7. Data Model (basic)

**Item:**
- `id`
- `name` (name / short description)
- `category` (shirt, pants, shoes, coat...)
- `color` (primary)
- `brand`
- `season` (summer / winter / all-year)
- `tags[]` (free-form)
- `images[]` (URLs to images in the closed dataset)
- `notes`
- `createdAt`

---

## 8. Non-functional Requirements

- **Responsiveness:** works nicely on mobile and desktop
- **Performance:** lazy-loaded images in the grid
- **Storage:** images and text in a private dataset (not exposed to search indexing)

---

## 9. Success Metrics (light)

- I actually open the site to decide what to wear
- Every item in the closet is documented with an image
- Time to add a new item < 1 minute

---

## 10. Open Questions / For Discussion

- How many users? (just me, or household members too?)
- Do we need saved "outfits" / clothing combinations in the future?
- Platform: Web only, or wrap as a mobile app later?
