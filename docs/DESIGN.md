# Stratos Office — Design System

> Visual identity, UI patterns, component specs, and design guidelines for the Full Suite.

---

## Brand Identity

### Name
**Stratos Office** — AI Office Assistant

### Tagline
"Private, local AI for your daily work."

### Brand Values
- **Privacy first** — all processing happens locally, no data leaves the device
- **Professional** — clean, enterprise-grade aesthetic
- **Efficient** — task-focused, minimal friction
- **Accessible** — WCAG AA compliant, keyboard navigable, screen reader friendly

---

## Color Palette

### Primary Colors

| Name | Hex | CSS Variable | Usage |
|---|---|---|---|
| Stratos Blue | `#0A2540` | `--surface-container` | Card backgrounds, secondary surfaces |
| Stratos Dark | `#061220` | `--background` | Page background, deep surfaces |
| Stratos Light | `#1A3A5C` | `--surface-container-highest` | Elevated cards, input backgrounds |
| Accent Blue | `#00D4FF` | `--primary` | Primary actions, active states, links |
| Accent Cyan | `#00E5CC` | `--secondary` | Secondary accents, success states, pulse indicators |

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
| Success | `#10B981` | Task complete, low risk |
| Warning | `#F59E0B` | Warnings, medium risk, amber states |
| Error | `#EF4444` | Errors, high risk, destructive actions |
| Info | `#3B82F6` | Informational messages, suggestions |

### Dark / Light Mode

| Token | Dark Mode | Light Mode |
|---|---|---|
| Background | `#061220` | `#F7F9FC` |
| Card | `#1A3A5C` | `#FFFFFF` |
| Text | `#FFFFFF` | `#1E293B` |
| Border | `rgba(255,255,255,0.1)` | `#E2E8F0` |

Theme is toggled via `data-theme` attribute on `<html>`. Persisted in `localStorage` via `settingsStore.ts`.

---

## Typography

### Font Families

| Role | Font | Weights | Load |
|---|---|---|---|
| Headings + Body | **Outfit** | 300, 400, 500, 600, 700 | Google Fonts |
| Code / Mono | **JetBrains Mono** | 400, 500 | Google Fonts |

### Type Scale

| Level | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| H1 | 48px / 3rem | 600 | 1.1 | Landing page title |
| H2 | 36px / 2.25rem | 600 | 1.2 | Section headers |
| H3 | 24px / 1.5rem | 500 | 1.3 | Card titles, panel headers |
| H4 | 20px / 1.25rem | 500 | 1.3 | Subsection headers |
| Body | 16px / 1rem | 400 | 1.5 | Default text |
| Small | 14px / 0.875rem | 400 | 1.4 | Labels, metadata |
| Caption | 12px / 0.75rem | 400 | 1.3 | Tooltips, footnotes, status labels |
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
│  TopBar (logo, search, settings, avatar)     │  64px fixed
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────┐  ┌───────────────────────┐   │
│  │            │  │                       │   │
│  │  Sidebar   │  │   Main Content Area   │   │
│  │  (nav)     │  │   TaskWorkspace or    │   │
│  │  280px     │  │   DashboardGrid       │   │
│  │            │  │                       │   │
│  └────────────┘  └───────────────────────┘   │
│                                              │
├──────────────────────────────────────────────┤
│  Footer (model status, TPS, version)         │  40px fixed
└──────────────────────────────────────────────┘
```

### Responsive Breakpoints

| Breakpoint | Width | Sidebar Behavior |
|---|---|---|
| Mobile | < 768px | Hidden; toggle button opens full-screen drawer overlay |
| Tablet | 768–1024px | Icon-only bar (64px wide) with tooltips on hover |
| Desktop | > 1024px | Full sidebar (280px wide) with labels |

### TaskWorkspace Layout

```
┌─────────────────────────────────────────────────────┐
│  Task title + description + ThinkingModeToggle      │  Header
├──────────────────────────┬──────────────────────────┤
│                          │                          │
│   InputPanel             │   OutputPanel            │
│   - FileUploadZone       │   - StreamingOutput      │
│   - AudioRecorderWidget  │   - MarkdownRenderer     │
│   - WebcamCapture        │   - JsonTreeView         │
│   - Textarea             │   - BoundingBoxCanvas    │
│   - PDFPageRangeSelector │   - HtmlPreviewFrame     │
│   - TokenEstimateDisplay │   - DiffView             │
│   - ContextLimitWarning  │   - ExportButton         │
│   - PrivacyNotice        │   - DisclaimerBanner     │
│   - Submit button        │   - Copy / Stop buttons  │
│                          │                          │
└──────────────────────────┴──────────────────────────┘
```

On mobile (< 768px): panels stack vertically, InputPanel above OutputPanel.

---

## Icon System

**Google Material Symbols Outlined** — font-based, loaded via Google Fonts CDN.

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
```

Wrapped by `src/components/ui/MaterialIcon.tsx`:

```tsx
<MaterialIcon name="document_scanner" size={24} />
<MaterialIcon name="bolt" size={24} filled />
```

### Task Category Icons

| Category | Icon Name |
|---|---|
| Documents | `description` |
| Visual | `image` |
| Audio | `mic` |
| Text & Writing | `edit_note` |
| Research | `biotech` |
| Privacy-First | `shield` |

### Common UI Icons

| Action | Icon Name |
|---|---|
| Settings | `settings` |
| History | `history` |
| Copy | `content_copy` |
| Download / Export | `download` |
| Delete | `delete` |
| Clear all | `delete_sweep` |
| Camera | `photo_camera` |
| Upload | `upload` |
| Submit / Run | `send` |
| Stop | `stop_circle` |
| Thinking mode | `psychology` |
| New task | `add` |
| Search | `search` |
| Close | `close` |
| Warning | `warning` |
| Success | `check_circle` |
| Privacy / Shield | `verified_user` |
| Speed / TPS | `speed` |

---

## Components

### Buttons

**Primary Button**
- Background: `var(--primary-container)` (`#00D4FF` tinted)
- Text: `var(--on-primary-container)` (dark navy)
- Border radius: 8px — Padding: 12px 24px — Font weight: 500
- Hover: `filter: brightness(1.1)` — Active: `scale(0.95)`
- Box shadow: `0 0 20px rgba(0, 212, 255, 0.3)`

**Secondary Button**
- Background: Transparent — Border: `1px solid rgba(255,255,255,0.1)`
- Text: `var(--on-surface-variant)` — Border radius: 8px

**Icon Button**
- Size: 40×40px — Border radius: 8px (or `rounded-full` for circular)
- Hover: `background: rgba(255,255,255,0.05)`

**Danger Button** (Clear cache, Clear all history)
- Background: `rgba(239, 68, 68, 0.1)` — Text: `var(--error)`
- Border: `1px solid rgba(239, 68, 68, 0.3)`

### Cards

- Background: `rgba(26, 58, 92, 0.5)` (Stratos Light at 50% opacity)
- Border: `1px solid rgba(255,255,255,0.05)`
- Border radius: 12px — Padding: 24px
- Hover: border brightens to `rgba(0, 212, 255, 0.5)`, slight lift shadow

### Glass Panel

```css
.glass-panel {
  background: rgba(4, 32, 59, 0.4);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
}
```

### Input Area (Textarea)

- Background: `var(--background)` with slight transparency
- Border: `1px solid rgba(255,255,255,0.1)` → focused: `1px solid var(--primary)`
- Border radius: 12px — Min height: 80px (auto-resize) — Padding: 16px
- Font: Outfit 16px

### Output Panel

- Background: `var(--background)`
- Border radius: 12px — Padding: 24px
- Code blocks: JetBrains Mono, syntax highlighted via highlight.js
- Copy button: top-right corner, icon-only

### File Upload Zone

- Dashed border: `2px dashed rgba(255,255,255,0.15)`
- Hover / drag-over: `2px dashed var(--primary)`, background tint
- Border radius: 12px — Padding: 32px — Center-aligned content
- Shows accepted formats and max size (50 MB)

### Sidebar

- Width: 280px (desktop), 64px (tablet), drawer overlay (mobile)
- Background: `rgba(4, 32, 59, 0.4)` with `backdrop-filter: blur(24px)`
- Border right: `1px solid rgba(255,255,255,0.1)`
- Active task: `background: rgba(0, 212, 255, 0.1)`, `border-right: 2px solid var(--primary-fixed-dim)`
- Category items expand/collapse with animated chevron

### Drawers (History, Settings)

- Slide in from right — Width: 360px
- Background: `var(--background)` with blur
- Overlay: `rgba(0,0,0,0.5)` backdrop
- Animation: 300ms ease-in-out

### Risk / Severity Badges

| Level | Background | Text |
|---|---|---|
| Low / Success | `rgba(16, 185, 129, 0.1)` | `#10B981` |
| Medium / Warning | `rgba(245, 158, 11, 0.1)` | `#F59E0B` |
| High / Error | `rgba(239, 68, 68, 0.1)` | `#EF4444` |
| Suggestion / Info | `rgba(59, 130, 246, 0.1)` | `#3B82F6` |

### Disclaimer Banner (Privacy Tasks)

- Non-dismissible amber banner below output
- Background: `rgba(245, 158, 11, 0.1)` — Border: `1px solid rgba(245, 158, 11, 0.3)`
- Icon: `warning` — Text: 14px Outfit

### Diff View (Redline Comparison)

| Change Type | Background | Border | Text Style |
|---|---|---|---|
| Addition | `rgba(16, 185, 129, 0.15)` | `2px solid #10B981` (left) | Normal |
| Deletion | `rgba(239, 68, 68, 0.15)` | `2px solid #EF4444` (left) | `line-through` |
| Modification (original) | `rgba(245, 158, 11, 0.1)` | — | Normal |
| Modification (revised) | `rgba(0, 229, 204, 0.1)` | — | Normal |

---

## Motion

### Transitions

| Action | Duration | Easing |
|---|---|---|
| Button hover | 150ms | ease-out |
| Panel / drawer open | 300ms | ease-in-out |
| Task selection | 200ms | ease-out |
| Loading spinner | 1s | linear (infinite) |
| Toast notification | 300ms | ease-out |
| Sidebar category expand | 200ms | ease-out |
| Streaming cursor blink | 500ms | step-end (infinite) |

### Reduced Motion

All Framer Motion animations check `useReducedMotion()`. When `prefers-reduced-motion: reduce` is set, animations are disabled or replaced with instant transitions.

### Loading States

- **Model loading**: Progress bar with percentage + current file name + ETA
- **Task running**: Streaming text with blinking cursor + elapsed time + TPS
- **File upload**: Thumbnail preview with progress ring

---

## Accessibility

- **Color contrast**: All text meets WCAG AA (4.5:1 normal text, 3:1 large text) in both dark and light modes
- **Focus states**: Visible focus rings on all interactive elements (2px `var(--primary)` outline)
- **Keyboard navigation**: Full keyboard operability with logical tab order
- **ARIA labels**: All icon-only buttons, form controls, and status indicators labeled
- **Live regions**: `aria-live="polite"` on streaming output, task completion, and error messages
- **Reduced motion**: `useReducedMotion()` hook disables Framer Motion animations
- **Alt text**: Descriptive alt on all non-decorative images including file previews
