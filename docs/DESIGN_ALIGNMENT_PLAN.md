# Design Alignment — Issues & Implementation Plan

> **Goal:** Bring the live app pixel-close to the Stitch/Canva design reference in `stitch_stratos_office_ai_ui/`.

---

## Issue Audit

### CRITICAL — Icon System Mismatch

The design uses **Material Symbols Outlined** (Google's Material Design icon font). The app uses **Lucide React** (SVG-based React icons). This is the single largest visual discrepancy — every screen has different icons.

| Screen | Design (Material Symbols) | App (Lucide React) |
|--------|--------------------------|-------------------|
| Landing Page | `dynamic_feed`, `document_scanner`, `audio_file`, `neurology`, `bolt`, `verified_user` | `Cpu`, `FileAudio`, `Brain`, `Zap`, `ShieldCheck` |
| Dashboard Cards | `document_scanner`, `receipt_long`, `transcribe`, `mail`, `monitoring`, `search_insights` | `Scan`, `Receipt`, `FileAudio`, `Mail`, `BarChart3`, `SearchCheck` |
| Sidebar | `biotech`, `description`, `image`, `mic`, `edit_note`, `history`, `settings` | `Microscope`, `FileText`, `ImageIcon`, `Mic`, `FileEdit`, `Brain`, `History`, `Settings` |
| TopBar | `search`, `settings`, `notifications`, `account_circle` | `Search`, `Settings`, `Bell`, `User` |
| Loading Screen | `biotech`, `schedule`, `verified_user` | `Microscope`, `Clock`, `ShieldCheck`, `AlertTriangle`, `RotateCcw` |
| History Drawer | `description`, `image`, `analytics`, `edit_note`, `sync_problem`, `delete_sweep` | `FileText`, `ImageIcon`, `BarChart3`, `FileEdit`, `ShieldAlert`, `Trash2` |
| Settings Drawer | `psychology`, `shield`, `palette`, `info`, `dark_mode`, `light_mode`, `save`, `delete_forever` | `BrainCircuit`, `Shield`, `Palette`, `Info`, `Moon`, `Sun`, `Save`, `Trash2` |

**Why it matters:** Material Symbols are filled/outline font glyphs with a distinct geometric style. Lucide icons are stroke-based SVGs with a different visual weight. The two systems look fundamentally different even when semantically equivalent.

---

### HIGH — CTA Button Text Color

**File:** `src/components/pages/LandingPage.tsx:64`

The "Load Gemma 4" button has `color: var(--on-background)` which resolves to `#d2e4ff` (light blue-white). The design expects `color: var(--on-primary-container)` which is `#00586b` (dark navy). On a `#00D4FF` cyan background, the light text has poor contrast while the dark text is crisp and readable.

---

### HIGH — History Drawer Task Color Coding

**File:** `src/components/drawers/HistoryDrawer.tsx:72`

Design uses different icon background colors per task category:
- Primary tasks → `bg-primary/10`
- Visual tasks → `bg-secondary/10`
- Tertiary tasks → `bg-tertiary-container/10`
- Failed tasks → `bg-error/10`

App only distinguishes Failed vs everything else (all non-failed get `bg-primary/0.1`).

---

### MEDIUM — Footer Missing "API Status" Link

**Files:** `src/App.tsx:52-53`, `src/App.tsx:74-75`

Design includes three footer links: Privacy, Terms, **API Status**. App only has Privacy and Terms.

---

### MEDIUM — Image Sources

Design uses Google-hosted AI-generated images for the dashboard insight section. App uses Unsplash URLs. This is cosmetic and the Unsplash images are acceptable placeholders, but the design-specific images would be more on-brand.

---

### LOW — Sidebar Brand Text Styling

**File:** `src/components/layout/Sidebar.tsx:35-36`

Design shows "Stratos Office" in `primary-container` color with `label-md` font (12px, 600 weight, 0.05em letter-spacing, uppercase). App uses `text-xs font-bold uppercase tracking-wider` which is close but not exact. Design also shows "Gemma 4 Active" in `on-surface-variant` at `body-sm`, app uses `text-sm font-medium`.

---

### LOW — Loading Screen Label Text

**File:** `src/components/pages/LoadingPage.tsx:71`

Design uses `font-label-md text-label-md uppercase tracking-widest` for the "System Initialization" label. App uses `text-[10px] font-bold uppercase tracking-widest`. The design's `label-md` is 12px/600 weight/0.05em letter-spacing vs app's 10px/bold.

---

### LOW — Dashboard Insight Section Image Opacity

**File:** `src/components/pages/DashboardPage.tsx:174`

Design uses `opacity-50` for the insight image. App uses `opacity-40`. Minor visual difference.

---

## Implementation Plan

### Phase 1: Switch to Material Symbols (CRITICAL)

**Estimated effort:** 2-3 hours

#### Step 1.1 — Add Material Symbols to index.html

Add the Google Fonts link for Material Symbols Outlined in `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
```

#### Step 1.2 — Create MaterialIcon wrapper component

**File:** `src/components/ui/MaterialIcon.tsx`

```tsx
interface MaterialIconProps {
  name: string;
  className?: string;
  filled?: boolean;
  size?: number;
}

export default function MaterialIcon({ name, className = "", filled = false, size = 24 }: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
        fontSize: size,
      }}
    >
      {name}
    </span>
  );
}
```

#### Step 1.3 — Replace icons in each component

| File | Changes |
|------|---------|
| `LandingPage.tsx` | Replace `Cpu` → `dynamic_feed`, `FileAudio` → `audio_file`, `Brain` → `neurology`, `Zap` → `bolt`, `ShieldCheck` → `verified_user`, `AlertTriangle` → `warning` |
| `DashboardPage.tsx` | Replace `Scan` → `document_scanner`, `Receipt` → `receipt_long`, `FileAudio` → `transcribe`, `Mail` → `mail`, `BarChart3` → `monitoring`, `SearchCheck` → `search_insights`, `ArrowUpRight` → `north_east`, `MoreHorizontal` → `more_horiz` |
| `Sidebar.tsx` | Replace `Microscope` → `biotech`, `Plus` → `add`, `FileText` → `description`, `ImageIcon` → `image`, `Mic` → `mic`, `FileEdit` → `edit_note`, `Brain` → `biotech`, `History` → `history`, `Settings` → `settings` |
| `TopBar.tsx` | Replace `Search` → `search`, `Settings` → `settings`, `Bell` → `notifications`, `User` → `account_circle` |
| `LoadingPage.tsx` | Replace `Microscope` → `biotech`, `ShieldCheck` → `verified_user`, `Clock` → `schedule`, `AlertTriangle` → `warning`, `RotateCcw` → `refresh` |
| `HistoryDrawer.tsx` | Replace `FileText` → `description`, `ImageIcon` → `image`, `BarChart3` → `analytics`, `FileEdit` → `edit_note`, `ShieldAlert` → `sync_problem`, `Trash2` → `delete_sweep`, `Search` → `search`, `X` → `close` |
| `SettingsDrawer.tsx` | Replace `BrainCircuit` → `psychology`, `Shield` → `shield`, `Palette` → `palette`, `Info` → `info`, `Moon` → `dark_mode`, `Sun` → `light_mode`, `Save` → `save`, `Trash2` → `delete_forever`, `X` → `close`, `Settings` → `settings` |
| `App.tsx` | Replace `Gauge` → `speed` |

#### Step 1.4 — Remove lucide-react dependency

After all replacements, remove `lucide-react` from `package.json` and run `npm install`.

---

### Phase 2: Fix CTA Button Text Color (HIGH)

**Estimated effort:** 5 minutes

**File:** `src/components/pages/LandingPage.tsx:64`

Change `color: "var(--on-background)"` to `color: "var(--on-primary-container)"` on the "Load Gemma 4" button.

---

### Phase 3: Fix History Drawer Color Coding (HIGH)

**Estimated effort:** 15 minutes

**File:** `src/components/drawers/HistoryDrawer.tsx`

Update the `historyItems` array to include a `category` field, then use it to determine icon background color:

```tsx
const historyItems = [
  { icon: "description", label: "Document OCR", time: "2 min ago", status: "Success", category: "primary" },
  { icon: "image", label: "Visual Synthesis", time: "15 min ago", status: "Success", category: "secondary" },
  { icon: "analytics", label: "Data Clustering", time: "Now", status: "In Progress", category: "primary", active: true },
  { icon: "edit_note", label: "Audit Summary", time: "1h ago", status: "Success", category: "tertiary" },
  { icon: "sync_problem", label: "Batch Import", time: "2h ago", status: "Failed", category: "error" },
];
```

Map categories to colors:
- `primary` → `rgba(168, 232, 255, 0.1)` + `var(--primary)`
- `secondary` → `rgba(111, 255, 232, 0.1)` + `var(--secondary)`
- `tertiary` → `rgba(254, 181, 40, 0.1)` + `var(--tertiary-container)`
- `error` → `rgba(255, 180, 171, 0.1)` + `var(--error)`

---

### Phase 4: Add "API Status" Footer Link (MEDIUM)

**Estimated effort:** 5 minutes

**File:** `src/App.tsx`

Add `<a>` for "API Status" in both the landing footer (~line 53) and dashboard footer (~line 75).

---

### Phase 5: Minor Style Tweaks (LOW)

**Estimated effort:** 20 minutes

| File | Change |
|------|--------|
| `Sidebar.tsx:35` | Change brand text to match design: `text-[12px] font-semibold tracking-[0.05em] uppercase` with `var(--primary-container)` |
| `Sidebar.tsx:36` | Change "Gemma 4 Active" to `text-[14px]` with `var(--on-surface-variant)` |
| `LoadingPage.tsx:71` | Change label to `text-[12px] font-semibold tracking-[0.05em]` |
| `DashboardPage.tsx:174` | Change image opacity from `opacity-40` to `opacity-50` |

---

## Execution Order

1. **Phase 1** (Icon swap) — Must be done first, affects every component
2. **Phase 2** (CTA color) — Quick fix, do immediately after icons
3. **Phase 3** (History colors) — Depends on Phase 1 (icon component)
4. **Phase 4** (Footer link) — Independent, quick
5. **Phase 5** (Minor tweaks) — Independent, polish pass

---

## Verification Checklist

After implementation, verify each screen against its design reference:

- [ ] Landing page: `stitch_stratos_office_ai_ui/stratos_office_landing_page/screen.png`
- [ ] Dashboard: `stitch_stratos_office_ai_ui/stratos_office_dashboard/screen.png`
- [ ] Loading screen: `stitch_stratos_office_ai_ui/stratos_office_loading_screen/screen.png`
- [ ] History panel: `stitch_stratos_office_ai_ui/stratos_office_history_panel/screen.png`
- [ ] Settings panel: `stitch_stratos_office_ai_ui/stratos_office_settings_panel/screen.png`

Key things to visually verify:
- [ ] All icons match design (same shape, same fill/outline style)
- [ ] "Load Gemma 4" button has dark text on cyan background
- [ ] History items have varied icon background colors
- [ ] Footer includes "API Status" link
- [ ] Sidebar brand text matches design typography
- [ ] Loading screen labels match design typography
- [ ] Dashboard insight image opacity matches design
