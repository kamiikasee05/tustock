# Sidebar Fix Specification

> Generated: 2026-07-14 by UX/UI Agent
> Purpose: Fix the oversized sidebar across the entire TUSTOCK React app

---

## Executive Summary

The sidebar width (240px desktop) **matches the Stitch reference exactly**. The perception of "oversized" comes from two compounding issues:

1. **Mobile sidebar is 20px wider than desktop** (260px vs 240px)
2. **Group labels add ~120px of vertical height** that doesn't exist in Stitch — the Stitch reference uses a flat nav list with no group headers
3. **Low stock alerts section** in sidebar adds vertical bulk not present in Stitch
4. **On smaller laptop screens** (1280-1366px), the 240px sidebar occupies 17-19% of viewport, making content feel cramped

---

## Issue 1: Mobile Sidebar Width (260px → 240px)

**Location:** `Layout.tsx:511`

| Property | Stitch Reference | Current (Mobile) | Current (Desktop) | Fix |
|----------|:----------------:|:----------------:|:-----------------:|:---:|
| Width | 240px | **260px** | 240px | Change mobile to 240px |

**File:** `web/src/components/Layout.tsx`
**Line:** 511 — `width: 260`
**Change to:** `width: 240`

This is the only width value that differs from Stitch. The desktop value of 240px is correct.

---

## Issue 2: Group Labels Add Excess Vertical Height

**Location:** `Layout.tsx:87-96` (`groupLabelStyle`) and `Layout.tsx:103-115` (navGroups mapping)

**Stitch reference:** The sidebar has a **flat list** of 9 nav items with NO group headers. The nav container uses `space-y-1` (4px gap between items).

**Current implementation:** 4 group labels ("Principal", "Inventario", "Gestion", "Utilidades"), each adding:
- Font: 11px uppercase, lineHeight 16px
- Padding: `var(--space-md) var(--space-md) var(--space-xs)` = 16px top, 16px horizontal, 4px bottom
- Total height per group label: ~36px

4 groups × 36px = **~144px of extra vertical space** that doesn't exist in Stitch.

### Recommended Fix: Collapse group labels to minimal separators

**Option A (Preferred — match Stitch):** Remove group labels entirely. Add `space-y-1` (4px gap) between all items. Use a subtle `margin-top: 24px` divider line between logical groups instead of text labels.

**Option B (If groups must stay):** Reduce group label to:
```
fontSize: 10px
lineHeight: 12px
padding: '8px 16px 2px'    /* reduced from 16px top to 8px */
letterSpacing: 0.06em
```
This saves ~40px vertically.

### Specific changes for Option A:

1. Remove `groupLabelStyle` (lines 87-96)
2. Remove the conditional rendering of `{!isBottom && <div style={groupLabelStyle}>{group.title}</div>}` (line 151)
3. Add a simple horizontal rule between groups: `borderTop: '1px solid rgba(66, 71, 84, 0.15)', marginTop: 8, marginBottom: 4`
4. Change the nav container to use `gap: 4` between all items (or `space-y-1` equivalent)

---

## Issue 3: Low Stock Alerts Section in Sidebar

**Location:** `Layout.tsx:186-219`

**Stitch reference:** No alerts section in the sidebar. Stock alerts appear only in the main content area as a card.

**Current implementation:** An alerts block at the bottom of the sidebar showing up to 3 low-stock items with names, quantities, and a "+N more" indicator. Height: ~80-120px depending on alert count.

### Recommended Fix: Move alerts to main content only

The alerts are already shown on the Dashboard as a card. Remove the sidebar alerts section entirely. This saves ~100px of vertical sidebar height.

If alerts must stay in sidebar, reduce to a simple count badge on the Dashboard nav item (which already exists via `badge: alerts.length`).

---

## Issue 4: Sidebar Scrollbar Styling

**Stitch reference:** Custom scrollbar — `width: 4px`, `thumb: #424753`

**Current implementation:** Global scrollbar styling in `index.css:118-134` — `width: 6px`, `thumb: var(--surface-variant)` → `#32353c`

### Recommended Fix: Match Stitch for sidebar

Add a class or scoped style for the sidebar nav:
```css
.sidebar-nav::-webkit-scrollbar { width: 4px; }
.sidebar-nav::-webkit-scrollbar-thumb { background: #424753; border-radius: 10px; }
```

---

## Issue 5: Logo Title Font Weight

**Location:** `Layout.tsx:124-131`

| Property | Stitch Reference | Current |
|----------|:----------------:|:-------:|
| fontSize | 24px | 24px ✅ |
| lineHeight | 32px | 32px ✅ |
| fontWeight | 600 (headline-md) | **700** |

The title "TUSTOCK" uses `fontWeight: 700` but Stitch's `headline-md` token specifies `fontWeight: 600`.

### Recommended Fix:
Change `fontWeight: 700` → `fontWeight: 600` at line 129.

---

## Issue 6: Active Nav Item — Border Color

**Location:** `Layout.tsx:84`

**Stitch reference:** Active item has `border-r-2 border-primary` = 2px solid primary on the right side.

**Current implementation:** `borderRight: isActive ? '2px solid var(--primary)' : '2px solid transparent'` ✅ Matches.

However, the active state also has `fontWeight: 700` while Stitch uses `font-bold` (700) for active and `font-medium` (500) for inactive. This matches. No change needed.

---

## Issue 7: Nav Item Line Height / Padding Density

**Stitch reference:** Nav items use `py-sm` (8px vertical padding) with `text-body-md` (16px/24px line-height). Total item height: ~40px.

**Current implementation:** `padding: 'var(--space-sm) var(--space-md)'` = 8px vertical, 16px horizontal. `fontSize: 16, lineHeight: 24`. Total item height: ~40px. ✅ Matches.

No change needed for individual item density.

---

## Issue 8: User Profile Card Size

**Location:** `Layout.tsx:222-260`

| Property | Stitch Reference | Current |
|----------|:----------------:|:-------:|
| Avatar | w-10 h-10 (40px) | 40×40px ✅ |
| Name font | body-sm (14px) bold | 14px 700 ✅ |
| Role font | 10px uppercase | 10px uppercase ✅ |
| Container padding | p-sm (8px) | var(--space-sm) = 8px ✅ |
| Container gap | gap-md (16px) | var(--space-md) = 16px ✅ |
| Border radius | rounded-xl (12px) | var(--radius-xl) = 24px ⚠️ |

### Minor Fix: Border radius
The user card uses `var(--radius-xl)` = 24px but Stitch uses `rounded-xl` = 12px.

Change at line 225: `borderRadius: 'var(--radius-xl)'` → `borderRadius: 'var(--radius-md)'`

---

## Summary of All Changes

### Files to modify:
- `web/src/components/Layout.tsx` — all sidebar fixes
- `web/src/index.css` — scrollbar styling (optional)

### Priority changes (reduce sidebar "heaviness"):

| # | Change | Location | Impact | Effort |
|---|--------|----------|:------:|:------:|
| 1 | Mobile sidebar width: 260 → 240 | Layout.tsx:511 | Medium | Trivial |
| 2 | Remove group labels, use flat nav with subtle dividers | Layout.tsx:87-96, 112-151 | **High** | Small |
| 3 | Remove low stock alerts from sidebar (keep on Dashboard only) | Layout.tsx:186-219 | Medium | Small |
| 4 | Logo fontWeight: 700 → 600 | Layout.tsx:129 | Low | Trivial |
| 5 | User card border-radius: 24px → 12px | Layout.tsx:225 | Low | Trivial |
| 6 | Sidebar scrollbar width: 6px → 4px | index.css or Layout | Low | Small |

### What does NOT need to change (verified correct):
- Desktop sidebar width: 240px ✅
- Desktop sidebar padding: 24px/16px ✅
- Nav item padding: 8px/16px ✅
- Nav item font size: 16px ✅
- Nav icon size: 24px ✅
- Active item border: 2px solid primary ✅
- Active/inactive font weights: 700/500 ✅
- User avatar size: 40px ✅
- User name/role fonts: 14px/10px ✅

---

## Impact on Content Pages (Products, Sales)

The sidebar width fix alone (240px, unchanged on desktop) won't affect content pages. However, if group labels are removed, the sidebar becomes visually lighter, which improves the perception of content area proportions.

### Products.tsx — No sidebar-related issues
- Uses `maxWidth: 1400` constraint ✅
- Table uses full available width ✅
- Form grid uses `1fr 1fr` ✅
- No oversized elements related to sidebar

### Sales.tsx — No sidebar-related issues  
- Uses `maxWidth: 1400` constraint ✅
- Cart + payment panel layout is responsive ✅
- No sidebar-related sizing issues

### Main content area — No changes needed
The `<main>` wrapper uses `flex: 1` which correctly fills remaining space after the 240px sidebar. No width adjustments needed for the content area.

---

## Expected Result After Fixes

- **Sidebar height reduction:** ~240px less vertical content (group labels + alerts)
- **Mobile sidebar:** Consistent 240px width (was 260px)
- **Visual weight:** Flat nav list matches the clean Stitch reference
- **Scroll behavior:** Sidebar content fits in viewport without scrolling on standard screens (1080p)
- **Content area:** Unchanged — still takes all remaining horizontal space
