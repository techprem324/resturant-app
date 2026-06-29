# Design System Spec: Midnight Reserve

Visual rules, design tokens, and components for the Lumina Restaurant OS.

---

## 1. Color Palettes
* **Foundation**: Matte charcoal background (`#121212`) for high contrast with visual photography.
* **Surface Containers**: Cards and widgets use `#1a1a1a` to create elevation.
* **Interactive Elements**: Borders use `rgba(255,255,255,0.08)` which glow to `rgba(255,191,0,0.3)` on hover.
* **Primary Accents**:
  * **Moody Vibe**: Amber (`#ffbf00`) / Gold (`#d4af37`)
  * **Fresh Vibe**: Muted Mint (`#81c784`) / Sage (`#4caf50`)
  * **Intimate Vibe**: Candle Red (`#ef5350`) / Warm Rose (`#f44336`)
  * **Social Vibe**: Smoked Copper (`#e0a96d`) / Cognac (`#d68029`)

---

## 2. Typography
* **Primary Family**: `DM Sans`, sans-serif.
* **Display Scale**:
  * `hero-title`: `64px`, letter-spacing `-0.03em`.
  * `section-title`: `40px`, letter-spacing `-0.02em`.
  * `card-title`: `20px`, weight `500`.
  * `label-caps`: `11px`, weight `700`, letter-spacing `0.15em`, uppercase.

---

## 3. Layout Grid & Spacing
* **Page Layout**: 12-column grid desktop, fluid 4-column mobile.
* **Bento Grids**: Admin dashboards and layout cells use a `gap: 24px` grid.
* **Outlines**: Borders are thin (`1px`) to maintain the atmospheric minimalist look.

---

## 4. Components & Interactive States
* **Morphing Buttons**: Primary CTA buttons expand dynamically, fading from transparent borders to solid gold fills.
* **Glassmorphic Headers**: Headers utilize `backdrop-filter: blur(12px)` and `background: rgba(18,18,18,0.7)`.
* **Animated Dial**: The Vibe selector uses a circular CSS rotation transition over `1s` with custom ease-out physics.
