# LiveOL System Design & Style Guide (v1.0)

## 1. Core Philosophy

**LiveOL** is a high-precision platform for orienteering results and editorials. The design language is **"The Digital Blueprint."** * **Function over Form:** No decorative elements; every line and color serves a purpose.

* **Engineering Aesthetic:** Utilize monospaced fonts for data, visible borders, and a grid-based layout.
* **Comfortable Density:** Provide enough whitespace to ensure clarity during high-stress live event viewing.

---

## 2. Visual Identity Specs

### A. Color Palette

| Token | Hex Code | Purpose |
| --- | --- | --- |
| `Brand-Primary` | `#FF5F00` | Navigation highlights, Live status, Primary CTAs. |
| `Brand-Success` | `#2D5A27` | Finishers, positive delta times, "Forest" themes. |
| `Base-Background` | `#F9F9F9` | Main site background (mimics map paper). |
| `Base-Surface` | `#FFFFFF` | Cards, Modal content, Table rows. |
| `Border-Default` | `#D1D5DB` | All structural dividers and component outlines. |
| `Text-Main` | `#1A202C` | Body copy and headings. |
| `Text-Muted` | `#718096` | Metadata, monospaced labels, timestamps. |

### B. Typography

* **Primary Typeface:** *Inter* or *Roboto* (Sans-serif). Use for articles and general UI.
* **Data Typeface:** *JetBrains Mono* or *Source Code Pro* (Monospace). **Requirement:** Use for all times, coordinates, bib numbers, and split-time calculations.

---

## 3. Component Architecture

### 3.1 Global Navigation

* **Structure:** Top-fixed bar, 64px height. `1px solid #D1D5DB` bottom border.
* **Logo:** "LiveOL" in bold Sans-serif, `1.25rem`.
* **Breadcrumbs:** Mandatory below the nav bar for all sub-pages. Format: `HOME / EVENTS / [EVENT_NAME]`.

### 3.2 Live Results Tables

* **Padding:** "Comfortable" (12px vertical padding per row).
* **Header:** Sticky top. Background: `Text-Main`, Text: White Monospace, Uppercase.
* **Columns:** 1.  Rank (Monospace)
2.  Name (Bold Sans-serif) - *Pinned on mobile*
3.  Club (Muted Sans-serif)
4.  Time/Status (Monospace, Primary Orange if currently live)
* **Interaction:** Row highlight on hover using `Base-Background`.

### 3.3 Table of Contents (TOC)

* **Placement:** Sticky sidebar (left) for editorials.
* **Visual:** A vertical line (`2px`) to the left of the list.
* **Active State:** The line segment and text turn `Brand-Primary` when the user scrolls to that section.

### 3.4 Cards (Event & Editorial)

* **Style:** `1px solid Border-Default`. No box-shadows.
* **Header Area:** Small monospaced label in top-right (e.g., `TYPE: LONG_DISTANCE` or `READ_TIME: 5MIN`).
* **Corners:** Sharp (0px to 2px radius).

### 3.5 Modals

* **Width:** Max  for runner details/splits.
* **Overlay:** 50% opacity `Text-Main`.
* **Structure:** Header with `1px` bottom border; Footer with right-aligned functional buttons.

---

## 4. Implementation Rules for AI Agents

1. **Grid System:** All spacing must be multiples of 8px (8, 16, 24, 32, 48, 64).
2. **Borders over Shadows:** Never use box-shadows. Use `1px` or `2px` solid borders to define depth and hierarchy.
3. **Iconography:** Use 2px stroke-based icons (e.g., Lucide). No filled icons.
4. **Data Alignment:** In tables, numerical data (times/points) must be **right-aligned** to ensure decimals and colons line up vertically.
5. **Live State:** Use an orange pulsing dot `(8px x 8px)` next to "LIVE" text for active events.

---

## 5. Editorial Content Guidelines

* **Max Width:** Articles should be constrained to a max-width of  for optimal reading.
* **Line Height:** Set to  for body text.
* **Callouts:** Use a "Technical Note" box for orienteering tips: Grey background, monospace title, sans-serif body.

---

**Would you like me to generate a specific "Page Schema" for a Live Results page or an Editorial article based on this guide?**