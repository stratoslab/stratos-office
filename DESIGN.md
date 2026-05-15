# Stratos Office — Design System

> Visual identity, UI patterns, and design guidelines for the AI Office Assistant.

---

## Brand Identity

### Name
**Stratos Office** — AI Office Assistant

### Tagline
"Private, local AI for your daily work."

### Brand Values
- **Privacy first** — all processing happens locally
- **Professional** — clean, enterprise-grade aesthetic
- **Efficient** — task-focused, minimal friction
- **Accessible** — works for everyone

---

## Color Palette

### Primary Colors

| Name | Hex | Usage |
|---|---|---|
| Stratos Blue | `#0A2540` | Primary background, headers |
| Stratos Dark | `#061220` | Deep backgrounds, landing page |
| Stratos Light | `#1A3A5C` | Secondary backgrounds, cards |
| Accent Blue | `#00D4FF` | Primary action buttons, links, highlights |
| Accent Cyan | `#00E5CC` | Secondary accents, success states |

### Neutral Colors

| Name | Hex | Usage |
|---|---|---|
| White | `#FFFFFF` | Text on dark backgrounds |
| Gray 100 | `#F7F9FC` | Light mode backgrounds |
| Gray 200 | `#E2E8F0` | Borders, dividers |
| Gray 400 | `#94A3B8` | Secondary text, placeholders |
| Gray 600 | `#475569` | Body text (light mode) |
| Gray 800 | `#1E293B` | Body text (dark mode) |

### Semantic Colors

| Name | Hex | Usage |
|---|---|---|
| Success | `#10B981` | Task complete, positive states |
| Warning | `#F59E0B` | Warnings, attention needed |
| Error | `#EF4444` | Errors, destructive actions |
| Info | `#3B82F6` | Informational messages |

---

## Typography

### Font Families

| Role | Font | Weights |
|---|---|---|
| Headings | **Outfit** | 300, 400, 500, 600, 700 |
| Body | **Outfit** | 300, 400, 500 |
| Code/Mono | **JetBrains Mono** | 400, 500 |

### Type Scale

| Level | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| H1 | 48px / 3rem | 600 | 1.1 | Landing page title |
| H2 | 36px / 2.25rem | 600 | 1.2 | Section headers |
| H3 | 24px / 1.5rem | 500 | 1.3 | Card titles, panel headers |
| H4 | 20px / 1.25rem | 500 | 1.3 | Subsection headers |
| Body | 16px / 1rem | 400 | 1.5 | Default text |
| Small | 14px / 0.875rem | 400 | 1.4 | Labels, metadata |
| Caption | 12px / 0.75rem | 400 | 1.3 | Tooltips, footnotes |
| Code | 14px / 0.875rem | 400 | 1.5 | Code blocks, JSON output |

---

## Spacing System

Base unit: **8px**

| Token | Value | Usage |
|---|---|---|
| xs | 4px | Tight spacing, icon gaps |
| sm | 8px | Element padding, small gaps |
| md | 16px | Component padding, card gaps |
| lg | 24px | Section padding |
| xl | 32px | Large section gaps |
| 2xl | 48px | Page-level spacing |
| 3xl | 64px | Landing page spacing |

---

## Layout

### Page Structure

```
┌──────────────────────────────────────────────┐
│  Header (logo, title, settings)              │  64px
├──────────────────────────────────────────────┤
│                                              │
│  Main Content Area                           │  Flex
│  ┌────────────┐  ┌───────────────────────┐   │
│  │            │  │                       │   │
│  │ Task       │  │   Input / Output      │   │
│  │ Selector   │  │   Area                │   │
│  │ (sidebar)  │  │                       │   │
│  │ 280px      │  │   Flexible            │   │
│  │            │  │                       │   │
│  └────────────┘  └───────────────────────┘   │
│                                              │
├──────────────────────────────────────────────┤
│  Footer (status, tokens/s, version)          │  40px
└──────────────────────────────────────────────┘
```

### Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 768px | Single column, stacked |
| Tablet | 768-1024px | Sidebar collapses to icon bar |
| Desktop | > 1024px | Full sidebar + main area |

---

## Components

### Buttons

**Primary Button:**
- Background: Accent Blue (`#00D4FF`)
- Text: Stratos Dark (`#061220`)
- Border radius: 8px
- Padding: 12px 24px
- Font weight: 500
- Hover: Brighten by 10%

**Secondary Button:**
- Background: Transparent
- Border: 1px solid Gray 200
- Text: White (dark mode) / Gray 800 (light mode)
- Border radius: 8px
- Padding: 12px 24px

**Icon Button:**
- Size: 40x40px
- Border radius: 8px
- Hover: Background Gray 200 (dark mode: Stratos Light)

### Cards

- Background: Stratos Light (`#1A3A5C`) with 50% opacity
- Border: 1px solid rgba(255,255,255,0.1)
- Border radius: 12px
- Padding: 24px
- Hover: Border brightens, slight lift shadow

### Task Cards (Quick Start)

- Grid layout, 2-4 columns depending on screen width
- Icon + title + short description
- Hover: Accent border highlight
- Click: Selects task type

### Input Area

- Background: Stratos Dark with slight transparency
- Border: 1px solid Gray 200 (focused: Accent Blue)
- Border radius: 12px
- Min height: 80px (auto-resize)
- Padding: 16px

### Output Display

- Background: Stratos Dark
- Border radius: 12px
- Padding: 24px
- Code blocks: JetBrains Mono, syntax highlighted
- Copy button: Top-right corner

### Settings Panel

- Slide-in panel from right
- Width: 360px
- Background: Stratos Dark
- Sections separated by Gray 200 borders

---

## Motion

### Transitions

| Action | Duration | Easing |
|---|---|---|
| Button hover | 150ms | ease-out |
| Panel open/close | 300ms | ease-in-out |
| Task selection | 200ms | ease-out |
| Loading spinner | 1s | linear (infinite) |
| Toast notification | 300ms | ease-out |

### Loading States

- **Model loading**: Progress bar with percentage, file name
- **Task running**: Streaming text with cursor animation
- **File upload**: Progress ring on file preview

---

## Dark Mode (Default)

Stratos Office defaults to dark mode with the color palette defined above. Light mode inverts the neutrals:

| Dark Mode | Light Mode |
|---|---|
| Background: `#061220` | Background: `#F7F9FC` |
| Card: `#1A3A5C` | Card: `#FFFFFF` |
| Text: `#FFFFFF` | Text: `#1E293B` |
| Border: `rgba(255,255,255,0.1)` | Border: `#E2E8F0` |

---

## Accessibility

- **Color contrast**: All text meets WCAG AA (4.5:1 minimum)
- **Focus states**: Visible focus rings on all interactive elements
- **Keyboard navigation**: All features accessible via keyboard
- **Screen readers**: ARIA labels on all interactive components
- **Reduced motion**: Respects `prefers-reduced-motion` system setting

---

## Iconography

Use a consistent icon set (recommended: Lucide Icons or Heroicons).

| Icon | Usage |
|---|---|
| FileText | Document tasks |
| Image | Visual tasks |
| Mic | Audio tasks |
| Type | Text tasks |
| Search | Research tasks |
| Settings | Settings panel |
| Copy | Copy to clipboard |
| Download | Export/download |
| Trash | Delete task history |
| Camera | Webcam capture |
| Upload | File upload |
| Send | Submit/run task |
| Stop | Cancel/stop task |
| Moon/Sun | Theme toggle |
