---
name: Midnight Ink / Pure
colors:
  surface: '#f8f9ff'
  surface-dim: '#d7dae1'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3fb'
  surface-container: '#ebeef5'
  surface-container-high: '#e5e8f0'
  surface-container-highest: '#e0e2ea'
  on-surface: '#181c21'
  on-surface-variant: '#43474b'
  inverse-surface: '#2d3136'
  inverse-on-surface: '#eef1f8'
  outline: '#73777c'
  outline-variant: '#c3c7cc'
  surface-tint: '#4c6171'
  primary: '#001421'
  on-primary: '#ffffff'
  primary-container: '#142937'
  on-primary-container: '#7c91a2'
  inverse-primary: '#b4c9dc'
  secondary: '#416900'
  on-secondary: '#ffffff'
  secondary-container: '#acf847'
  on-secondary-container: '#457000'
  tertiary: '#1e0f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#3a2200'
  on-tertiary-container: '#c77e00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d0e5f8'
  primary-fixed-dim: '#b4c9dc'
  on-primary-fixed: '#071e2b'
  on-primary-fixed-variant: '#354958'
  secondary-fixed: '#acf847'
  secondary-fixed-dim: '#91db2a'
  on-secondary-fixed: '#102000'
  on-secondary-fixed-variant: '#304f00'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#181c21'
  surface-variant: '#e0e2ea'
typography:
  display-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Bricolage Grotesque
    fontSize: 36px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-md:
    fontFamily: Bricolage Grotesque
    fontSize: 24px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  body-main:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  label-ui:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.02em
  data-tabular:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '700'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style

This design system targets adult professionals seeking a "grown-up" educational experience. It balances the dopamine-driven engagement of gamified learning with a premium, restrained aesthetic. The brand personality is the "Smart Friend"—witty, brutally honest, and intellectually sharp. 

The visual style is **Corporate Modern with a Brutalist edge**. It uses high-contrast typography and a rigid grid to maintain professional authority, while utilizing vibrant accent "glows" (Lime) and "streaks" (Amber) to celebrate progress. The mascot, **Nova**, should be rendered as a geometric North Star using sharp angles and hairline strokes, avoiding the soft, bubbly aesthetics typical of children's apps.

The emotional response should be one of **serious play**: the user feels they are doing important work, but the interface responds with tactile, high-energy feedback.

## Colors

The palette is built on the **Midnight Ink** concept. In Light Mode, the "Pure" white background provides a clean, editorial feel. In Dark Mode, absolute black (#000000) creates a high-end "OLED" depth. 

- **Brand Navy:** Used for primary structural elements and the default button state in Light Mode. 
- **Accent Lime:** Reserved strictly for success states, completed lessons, and "Glow" effects. It represents growth.
- **Streak Amber:** Used exclusively for momentum and daily streaks.
- **Muted Text:** Used for secondary metadata and instructional labels to maintain hierarchy.

## Typography

The typography system uses three distinct fonts to separate content roles:
1. **Bricolage Grotesque (Display):** Used for headlines and celebratory moments. Must be set with tight leading and negative tracking to feel "inked" and impactful.
2. **Inter (Body):** Used for all long-form reading and instructional content. A generous 1.6 line-height ensures readability for adult learners.
3. **Space Grotesk (UI/Numbers):** Used for buttons, chips, progress percentages, and lesson timers. It provides a technical, precise contrast to the expressive headlines. 

Always use tabular lining for numbers in Space Grotesk to prevent layout jitter during count-ups or timers.

## Layout & Spacing

The design system utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

- **Rhythm:** All spacing is derived from a 4px base unit. 
- **Density:** Elements are spaced generously (24px - 32px) to evoke a premium editorial feel, avoiding the cluttered "busy-ness" of casual gaming apps.
- **Gutters:** Gutters are fixed at 24px on desktop to maintain clear vertical lanes for information. 
- **Reflow:** On mobile, side margins shrink to 16px. Cards typically stack vertically to occupy the full width of the container.

## Elevation & Depth

This design system prioritizes **Tonal Layers** and **Low-Contrast Outlines** over heavy shadows. 

- **Surface Tiering:** The background is the lowest level. `Surface` colors are used for cards, and `Raised` colors (often white in light mode) are used for active elements like inputs or selected states.
- **Borders:** All containers must use a **hairline border** (1px). In light mode, use the defined Border color; in dark mode, the border should be slightly more luminous than the surface to define the edge.
- **Overlays:** Only Modals and Dropdown menus use shadows. These should be **Ambient Shadows**: extra-diffused (20px-40px blur), low opacity (10-15%), and tinted with the Brand Navy to prevent a "muddy" gray look.

## Shapes

The shape language is sophisticated and consistent. 
- **Standard UI (Buttons/Cards):** Use a 12px radius. This is soft enough to feel modern but sharp enough to remain professional.
- **Modals/Large Containers:** Use a 16px radius to signify they are parent containers.
- **Interactive States:** Avoid "pill" shapes for buttons to maintain the "grown-up" aesthetic. The 12px squircle-adjacent corner is the signature shape of the design system.

## Components

- **Buttons:**
  - **Primary (Light):** Navy background, White text. No shadow. High-contrast.
  - **Primary (Dark):** White background, Black text. 
  - **Secondary:** Transparent background, 1px Border, Space Grotesk text.
- **Cards:** Use the `Surface` background with a 1px border. Do not use shadows for static cards. On hover, the border can transition to Brand Navy or Accent Lime.
- **Input Fields:** 1px border with `Raised` background. Labels must use `label-ui` (Space Grotesk).
- **Chips/Badges:** Small, 4px radius, using Space Grotesk. Use Accent Lime for "Correct" and Streak Amber for "Streak" status.
- **Progress Bars:** Thin 4px tracks. The filled portion should use a gradient from Brand Navy to Accent Lime to indicate "charging up" or "completing."
- **Checkboxes/Radios:** Square with 4px radius (checkbox) or circular (radio). Use hairline borders. When selected, fill with Brand Navy and use a 1px white inset stroke.