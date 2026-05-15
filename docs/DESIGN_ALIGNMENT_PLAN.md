# Design Alignment — Status

> This document previously tracked the migration from Lucide React icons to Google Material Symbols Outlined. That migration is **complete**.

---

## Completed Migrations

### ✅ Icon System — Material Symbols Outlined

All components now use `src/components/ui/MaterialIcon.tsx` with Google Material Symbols Outlined. Lucide React has been removed.

The Material Symbols font is loaded via Google Fonts CDN in `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
```

Usage:
```tsx
<MaterialIcon name="document_scanner" size={24} />
<MaterialIcon name="bolt" size={24} filled />
```

### ✅ CTA Button Text Color
"Load Gemma 4" button uses `color: var(--on-primary-container)` (dark navy on cyan background).

### ✅ Footer Links
All footers include Privacy, Terms, and API Status links.

### ✅ Sidebar Brand Typography
Brand text uses `text-[12px] font-semibold tracking-[0.05em] uppercase` with `var(--primary-container)`.

---

## Active Deviation: Icon Spec vs Implementation

**Requirements doc (Req 1.5)** specifies Lucide icons. The implementation uses Google Material Symbols Outlined. This is a tracked, intentional deviation — the existing codebase migrated to Material Symbols before the spec was written. The spec should be updated in a future revision to reflect this.

---

## Current Design Reference

For the full, up-to-date design system, see:

- **[DESIGN.md](./DESIGN.md)** — Color palette, typography, spacing, component specs, motion, accessibility
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — Technical architecture and component hierarchy
- **[Spec Design Doc](../.kiro/specs/stratos-office-full-suite/design.md)** — Full suite design decisions and data models

The Stitch/Canva reference screens in `stitch_stratos_office_ai_ui/` remain available as visual references but the live app is now the source of truth for design decisions.
