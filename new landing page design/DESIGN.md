# Design System Strategy: Monochrome Precision

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Technical Monolith."** 

Unlike generic "clean" interfaces, this system treats a competitive coding environment with the gravity of a high-end editorial journal combined with the precision of a code editor. It moves beyond standard layouts by using high-contrast monochrome depth, extreme white space, and intentional asymmetry to guide the eye toward logic and data. 

We break the "template" look by avoiding traditional box-shadows and thick borders. Instead, we use tonal shifts and "ghost" elevations to create a sense of digital permanence. The interface doesn't just display information; it frames it.

---

## 2. Colors & Surface Architecture

The palette is strictly neutral, focusing on the interplay between `primary` (#000000) and the various `surface` tiers. 

### The "No-Line" Rule
Standard 1px solid borders for sectioning are strictly prohibited. Section boundaries must be defined through background shifts. For example, a sidebar should use `surface-container-low` (#F4F3F3) sitting against a main `background` (#FAF9F9). This creates a sophisticated, "magazine" feel rather than a rigid "application" feel.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. We use tonal transitions to indicate depth:
- **Base Layer:** `surface` (#FAF9F9) – General page background.
- **Content Sections:** `surface-container-low` (#F4F3F3) – Grouping large areas of content.
- **Action Cards:** `surface-container-lowest` (#FFFFFF) – Highlighting interactive or prioritized units.
- **Embedded Elements:** `surface-container-high` (#E9E8E8) – For code blocks or nested data tables.

### The "Glass & Gradient" Rule
To add visual "soul" to the monochromatic aesthetic, use semi-transparent surface colors with `backdrop-blur`. For example, a sticky navigation bar should utilize `surface` at 80% opacity with a 12px blur. For primary CTAs, a subtle linear gradient from `primary` (#000000) to `primary-container` (#1C1B1B) adds a premium tactile finish that flat black lacks.

---

## 3. Typography: Editorial Utility

The typography system relies on **Inter** to bridge the gap between human-readable editorial and machine-precise code.

- **Display (display-lg to display-sm):** Used for landing page hero moments and massive scoreboards. Utilize tight letter-spacing (-0.02em) for a bold, authoritative impact.
- **Headline (headline-lg to headline-sm):** Used for page titles and major section headers. These should always be `on_surface` (#1A1C1C) to maintain maximum contrast.
- **Body (body-lg to body-sm):** Optimized for long-form reading and problem descriptions. Use `on_surface_variant` (#444748) for secondary body text to reduce visual noise.
- **Label (label-md to label-sm):** Reserved for technical metadata, "Line Numbers," and "Status Tags." These should be uppercase with slightly increased tracking (+0.05em) for a "system output" aesthetic.

---

## 4. Elevation & Depth: Tonal Layering

We reject the "floating" appearance of 2010-era design in favor of **Ambient Presence.**

*   **The Layering Principle:** Depth is achieved by "stacking" tones. An active code card (`surface-container-lowest`) placed on a workspace background (`surface-container-low`) creates a natural lift.
*   **Ambient Shadows:** When an element must float (e.g., a modal or dropdown), use a shadow with a blur radius of 32px and a transparency of 4%–6%. The shadow color must be the `surface_tint` (#5F5E5E) rather than pure black to keep the UI feeling airy.
*   **The "Ghost Border" Fallback:** If a container requires a border for accessibility (such as a text input), use the `outline_variant` (#C4C7C7) at 20% opacity. 100% opaque borders are too "loud" for this system.
*   **Glassmorphism:** Use `surface_container_lowest` at 70% opacity with a background blur for floating tooltips or floating action menus to ensure the underlying code remains partially visible, maintaining the "context" of the competition.

---

## 5. Components

### Buttons
- **Primary:** High-contrast `primary` (#000000) background with `on_primary` (#FFFFFF) text. No border. Use `xl` (0.75rem) roundedness for a modern, approachable feel.
- **Secondary:** `secondary_container` (#E0DFDF) with `on_secondary_container` (#626363).
- **Tertiary:** No background. `on_surface` text with a subtle underline appearing only on hover.

### Cards & Lists
**Forbid divider lines.** Use the spacing scale (e.g., `8` - 2rem) to separate list items. For cards, use `surface-container-lowest` on top of `surface-container-low` for separation.

### Input Fields (Code & Text)
- **Resting:** `surface-container-highest` (#E3E2E2) background with a 20% opacity `outline_variant` ghost border.
- **Focus:** `primary` 1px border. No glow; use a subtle background shift to `surface-container-lowest` to indicate activity.

### Additional Signature Components
- **The "Pulse" Indicator:** For real-time updates (e.g., a live match), use a small circle with a subtle `on_error_container` tint pulse.
- **Progress Monolith:** A thin, high-contrast bar at the very top of the page (1.5 spacing unit) using a gradient from `primary` to `secondary` to show time remaining in a clash.

---

## 6. Do's and Don'ts

### Do:
- **DO** use asymmetry. Place a `display-lg` header off-center to create an editorial, non-templated look.
- **DO** lean into "Breathing Room." When in doubt, increase padding using the `16` (4rem) or `20` (5rem) spacing tokens.
- **DO** use `label-sm` for technical data like "Execution Time" or "Memory Usage" to give it a "pro-tool" feel.

### Don't:
- **DON'T** use pure grey #808080. Always use the specified tokens like `on_surface_variant` to ensure the neutral tones remain cohesive.
- **DON'T** use 100% black text on 100% white backgrounds for long reading sections. Use `on_surface` on `surface` for a more premium, "ink on paper" feel.
- **DON'T** use icons as the primary way to communicate. In this system, typography is king; icons are merely supportive "punctuation."