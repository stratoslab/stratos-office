---
name: Stratos AI
colors:
  surface: '#00142a'
  surface-dim: '#00142a'
  surface-bright: '#233a56'
  surface-container-lowest: '#000f21'
  surface-container-low: '#001c37'
  surface-container: '#04203b'
  surface-container-high: '#122b46'
  surface-container-highest: '#1e3652'
  on-surface: '#d2e4ff'
  on-surface-variant: '#bbc9cf'
  inverse-surface: '#d2e4ff'
  inverse-on-surface: '#19324d'
  outline: '#859398'
  outline-variant: '#3c494e'
  surface-tint: '#3cd7ff'
  primary: '#a8e8ff'
  on-primary: '#003642'
  primary-container: '#00d4ff'
  on-primary-container: '#00586b'
  inverse-primary: '#00677e'
  secondary: '#6fffe8'
  on-secondary: '#003730'
  secondary-container: '#00e5cc'
  on-secondary-container: '#006156'
  tertiary: '#ffd9a1'
  on-tertiary: '#432c00'
  tertiary-container: '#feb528'
  on-tertiary-container: '#6c4900'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#b4ebff'
  primary-fixed-dim: '#3cd7ff'
  on-primary-fixed: '#001f27'
  on-primary-fixed-variant: '#004e5f'
  secondary-fixed: '#41fce2'
  secondary-fixed-dim: '#00dfc6'
  on-secondary-fixed: '#00201b'
  on-secondary-fixed-variant: '#005047'
  tertiary-fixed: '#ffdeae'
  tertiary-fixed-dim: '#ffba3d'
  on-tertiary-fixed: '#281900'
  on-tertiary-fixed-variant: '#604100'
  background: '#00142a'
  on-background: '#d2e4ff'
  surface-variant: '#1e3652'
typography:
  headline-xl:
    fontFamily: Outfit
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Outfit
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

The design system is engineered for a high-performance, enterprise-grade AI environment. It balances the cutting-edge nature of artificial intelligence with the reliability required for corporate productivity. The aesthetic is rooted in **Glassmorphism**, utilizing depth and transparency to manage complex information densities without overwhelming the user. 

The emotional response is one of **focused intelligence** and **secure efficiency**. By leveraging a dark-mode-first approach with high-precision accents, the UI recedes to prioritize content while using vibrant cyan highlights to guide the user's attention toward AI-driven insights and primary actions.

## Colors

The palette is anchored by a deep, multi-tonal navy foundation that ensures visual comfort during extended work sessions. 

- **Primary (#00D4FF):** A high-vibrancy cyan used for core interactive elements, focus states, and primary AI indicators.
- **Secondary (#00E5CC):** A softer teal used for secondary data visualizations, success states, and subtle categorizations.
- **Background:** A linear gradient from top-left (#0A2540) to bottom-right (#061220) creates a sense of infinite depth.
- **Surfaces:** Dark navy tints with 40% opacity form the glass panels, allowing background gradients to subtly bleed through.

## Typography

This design system utilizes **Outfit** across all levels to maintain a clean, geometric, and modern feel. The typeface’s open apertures ensure high legibility even at small sizes in data-heavy dashboards.

Headlines use tighter letter-spacing and heavier weights to command authority. Body text remains generous in line-height to facilitate long-form reading of AI-generated reports. Labels utilize increased letter-spacing and uppercase styling for clear categorization of metadata and system statuses.

## Layout & Spacing

The system operates on an **8px linear grid** to ensure mathematical harmony across all components. 

- **Desktop:** A 12-column fluid grid with 24px gutters. Content is typically contained within wide-span glass panels (8-10 columns) for focus.
- **Tablet:** An 8-column grid with 16px margins.
- **Mobile:** A 4-column grid with 16px margins. 

Layouts should prioritize "Safe Zones"—large padding within glass containers (typically 24px or 32px) to prevent content from feeling cramped against the frosted borders.

## Elevation & Depth

Hierarchy is established through **Glassmorphism** and background blurs rather than traditional drop shadows.

- **Level 1 (Base):** The background gradient.
- **Level 2 (Panels):** Semi-transparent surfaces (#0A2540 at 40% opacity) with a 20px Backdrop Blur. A 1px solid border (#FFFFFF at 10% opacity) defines the edge.
- **Level 3 (Floating):** Modals and popovers use a higher opacity background (60%) and a subtle outer glow using the primary cyan color at 5% opacity to simulate light emission from the AI.

Avoid using heavy black shadows; instead, use "Inner Glows" (1px stroke) to simulate light hitting the edge of the glass.

## Shapes

The shape language is consistently **Rounded (Level 2)**. 

- Standard components (Buttons, Inputs, Chips) utilize a **12px (0.75rem)** corner radius.
- Large containers and glass panels utilize a **24px (1.5rem)** corner radius to feel softer and more approachable.
- All icons must be **Line-style** with a 2px stroke weight and rounded caps to match the typography and corner radii.

## Components

### Buttons
- **Primary:** Solid #00D4FF fill with dark navy text. No gradients. Hover state increases brightness by 10%.
- **Secondary:** Solid #0A2540 fill with a #00D4FF 1px border.
- **Focus State:** A 2px cyan (#00D4FF) outline ring with a 2px offset.

### Input Fields
- Transparent background with a 1px border (#FFFFFF at 20% opacity). 
- On focus, the border transitions to #00D4FF with a subtle cyan outer glow.

### Chips & Tags
- Pill-shaped with a 10% opacity cyan fill and 100% opacity cyan text. Used for status indicators and AI-suggested prompts.

### Cards & Panels
- Must utilize the backdrop-filter (blur) property. Content within cards should have a minimum of 24px internal padding.

### Icons
- Exclusively 24px line-style icons. Stroke color should match the surrounding text (Primary Cyan for active states, White/Grey for inactive).

### AI Indicators
- Use a shimmering "pulse" effect on the #00E5CC teal accent to indicate background processing or "AI thinking" states.