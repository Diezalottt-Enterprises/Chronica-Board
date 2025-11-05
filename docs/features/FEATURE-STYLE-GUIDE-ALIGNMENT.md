# FEATURE: Stack Junkie Universal Style Guide v0.3 Alignment

**Status:** Not Started
**Priority:** High
**Complexity:** High
**Estimated Time:** 2-3 days
**Dependencies:** None (Foundation for other features)

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Requirements](#requirements)
3. [Current State Analysis](#current-state-analysis)
4. [Proposed Changes](#proposed-changes)
5. [Implementation Steps](#implementation-steps)
6. [Files to Modify](#files-to-modify)
7. [New Files to Create](#new-files-to-create)
8. [Dependencies & Side Effects](#dependencies--side-effects)
9. [Testing Checklist](#testing-checklist)
10. [Success Criteria](#success-criteria)
11. [Migration Notes](#migration-notes)
12. [Rollback Plan](#rollback-plan)

---

## Feature Overview

### What

Migrate Chronica's entire color, spacing, typography, and component system from the current ad-hoc CSS implementation to the **Stack Junkie Universal Style Guide v0.3** token-based system.

### Why

- **Consistency:** Align with Chris's universal design system across all projects
- **Maintainability:** Centralized token management instead of scattered hardcoded values
- **Themability:** Proper light/dark/high-contrast mode support
- **Scalability:** Easy to add new themes or adjust colors globally
- **Professionalism:** Follow industry best practices with design tokens

### User Benefit

- Better visual consistency across the app
- Improved accessibility with high-contrast mode
- Smoother theme transitions
- Future-proof design system

---

## Requirements

### Style Guide Compliance Checklist

#### 1. Color System (Section 4 of style guide)

- [x] Replace all ad-hoc color variables with semantic tokens
- [x] Implement framework neutrals (Ink/Mist for light, Night/Cloud for dark)
- [x] Add semantic tokens (primary, accent, success, warning, danger, info)
- [x] Remove product-specific colors (mint, cyan, salmon, lavender, slate) from CSS
- [x] Support 3 themes: light, dark, high-contrast
- [x] Use `data-theme` attribute on `<html>`
- [x] No hardcoded hex values in components (use tokens only)

#### 2. Typography System (Section 5)

- [x] Use Inter font stack for headings and body
- [x] Implement complete type scale (xs through 7xl)
- [x] Set base size to 16px minimum
- [x] Line height 1.5-1.7 for body text
- [x] Proper font weights (400-600 for body, 600-800 for headings)

#### 3. Spacing System (Section 6)

- [x] Base unit: 4px
- [x] Spacing tokens: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20
- [x] Replace fluid clamp() spacing with fixed token values

#### 4. Radius & Shadows (Section 7)

- [x] 7 radius levels: xs (4px) through 2xl (24px), plus full (9999px)
- [x] 5 shadow levels: xs, sm, md, lg, xl
- [x] Different shadow opacity for light vs dark themes

#### 5. Motion & Animation (Section 8)

- [x] Duration tokens: fast (100ms), base (200ms), slow (300-400ms)
- [x] Easing functions: ease-in, ease-out, ease-in-out, ease-spring
- [x] Respect `prefers-reduced-motion`

#### 6. Iconography (Section 9)

- [x] Icon size tokens: xs (16px), sm (20px), md (24px), lg (32px), xl (40px)

#### 7. Component Standards (Section 12)

- [x] Focus rings visible in all themes
- [x] Proper interactive states (hover, active, disabled)
- [x] Minimum 44x44px hit targets

#### 8. Accessibility (Section 3)

- [x] WCAG 2.2 AA minimum contrast (4.5:1 normal, 3:1 large)
- [x] High-contrast theme for accessibility
- [x] No meaning conveyed by color alone

---

## Current State Analysis

### Current Color Variables (App.css lines 10-76)

**Light Theme (lines 10-26):**

```css
--color-mint: #98d8c8; /* Product color - REMOVE */
--color-cyan: #6fc2db; /* Product color - REMOVE */
--color-salmon: #f88379; /* Product color - REMOVE */
--color-lavender: #b4a7d6; /* Product color - REMOVE */
--color-slate: #8d99ae; /* Product color - REMOVE */
--bg: #f7f7f9; /* → --bg-surface */
--surface: #ffffff; /* → --bg-surface */
--bg-primary: #ffffff; /* → --bg-surface */
--bg-secondary: #f5f5f5; /* → --bg-elevated */
--bg-tertiary: #e8e8e8; /* → --bg-elevated-2 */
--border-color: #e5e7eb; /* → --border */
--text-primary: #111827; /* → --text-primary (Ink 900) */
--text-secondary: #6c757d; /* → --text-secondary (Ink 700) */
--shadow: rgba(0, 0, 0, 0.1); /* → --shadow-* tokens */
```

**Dark Theme (lines 64-76):**

```css
--bg: #0b1020; /* → --bg-surface (Night 800) */
--surface: #141824; /* → --bg-surface (Night 700) */
--bg-primary: #141824; /* → --bg-surface */
--bg-elevated: #1a1f2e; /* → --bg-elevated (Night 600) */
--bg-tertiary: #222836; /* → --bg-elevated-2 */
--border-color: #2b3240; /* → --border (Night 400) */
--text-primary: #e5e7eb; /* → --text-primary (Cloud 100) */
--text-secondary: #9ca3af; /* → --text-secondary (Cloud 200) */
--shadow: rgba(0, 0, 0, 0.3); /* → --shadow-* tokens */
```

### Hardcoded Color Locations (19+ occurrences)

**File: App.css**

1. Line 159: `background: var(--color-cyan)` → `background: var(--color-primary)`
2. Line 164: `background: #5ab0c9` → `background: var(--color-primary-hover)` or calculate
3. Line 190, 198: `background: var(--color-cyan)` → `background: var(--color-primary)`
4. Line 293: `background: var(--color-cyan)` → `background: var(--color-primary)`
5. Line 388-389: `border-color/color: var(--color-cyan)` → `var(--color-primary)`
6. Line 424, 434-435: Focus states with cyan → primary
7. Line 486-487: Add card hover → primary
8. Line 493: `background: white` → `background: var(--bg-surface)` **CRITICAL FIX**
9. Line 502, 537: `color: #111827` → `color: var(--text-primary)` **CRITICAL FIX**
10. Line 545: `color: #6c757d` → `color: var(--text-secondary)` **CRITICAL FIX**
11. Line 565, 567: Card tag colors → use semantic tokens
12. Line 757-758: Danger hover → `var(--color-danger)` and danger background
13. Line 877, 881: Error text/border → `var(--color-danger)`
14. Line 948: Destructive menu → `var(--color-danger)`
15. Lines 852, 900, 1012: Focus outlines → `var(--ring)`

**File: Header.tsx (line 19)** 16. `color: "var(--color-salmon)"` → `color: "var(--color-danger)"`

**File: SettingsModal.tsx (lines 103-104, 120-121)** 17. Active tab: cyan → primary

**File: ImportModal.tsx (lines 196-197)** 18. Error display: `#ffe5e5`, `#d32f2f` → danger tokens

**File: ColorPicker.tsx (lines 12-19)** 19. Quick swatches: Replace with semantic + brand colors

### Missing Token Categories

1. **Shadows:** Only one shadow value, need 5 levels (xs, sm, md, lg, xl)
2. **Radius:** Partially defined, need exact values from guide
3. **Spacing:** Uses fluid clamp(), need fixed values
4. **Typography:** Missing xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl
5. **Motion:** No duration or easing tokens
6. **Icon Sizes:** Not defined
7. **Semantic Colors:** Missing success, warning, danger, info
8. **Additional:** No link, link-hover, ring, overlay, gradient, selection tokens

---

## Proposed Changes

### 1. Token File Structure

**New Files:**

```
src/
  styles/
    tokens/
      light.css       # Light theme tokens
      dark.css        # Dark theme tokens
      high-contrast.css # High-contrast theme
      base.css        # Theme-independent tokens (spacing, radius, etc.)
    index.css         # Imports all token files
```

**Modified Files:**

- `src/App.css` → Import `styles/index.css`, remove all color definitions
- `src/main.tsx` → Import `styles/index.css` instead of `App.css`

### 2. Complete Token Definitions

#### Base Tokens (base.css) - Theme Independent

```css
/* src/styles/tokens/base.css */

/* Spacing - 4px base unit */
:root {
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
}

/* Border Radius */
:root {
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
}

/* Typography Scale */
:root {
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 30px;
  --text-4xl: 36px;
  --text-5xl: 48px;
  --text-6xl: 60px;
  --text-7xl: 72px;
}

/* Icon Sizes */
:root {
  --icon-xs: 16px;
  --icon-sm: 20px;
  --icon-md: 24px;
  --icon-lg: 32px;
  --icon-xl: 40px;
}

/* Motion */
:root {
  --duration-fast: 100ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;

  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Font Families */
:root {
  --font-heading: Inter, Poppins, system-ui, -apple-system, sans-serif;
  --font-body: Inter, system-ui, -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", ui-monospace, monospace;
}
```

#### Light Theme Tokens (light.css)

```css
/* src/styles/tokens/light.css */

:root {
  /* Framework Neutrals */
  --ink-900: #0b0c10;
  --ink-700: #1f232b;
  --ink-500: #5b6575;
  --mist-100: #f5f7fa;
  --mist-200: #edf1f5;
  --mist-400: #cbd4df;
  --white: #ffffff;

  /* Semantic Mapping */
  --text-primary: var(--ink-900);
  --text-secondary: var(--ink-700);
  --text-muted: var(--ink-500);

  --bg-surface: var(--white);
  --bg-elevated: var(--mist-100);
  --bg-elevated-2: var(--mist-200);

  --border: var(--mist-400);

  /* Semantic Colors */
  --color-primary: #2563eb;
  --color-accent: #3b82f6;
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-danger: #dc2626;
  --color-info: #0284c7;

  /* Interactive States */
  --link: var(--color-primary);
  --link-hover: var(--color-accent);
  --ring: rgba(37, 99, 235, 0.45);

  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);

  /* Overlay */
  --overlay: rgba(10, 11, 13, 0.35);

  /* Selection */
  --selection-bg: rgba(37, 99, 235, 0.18);
  --selection-text: var(--text-primary);

  /* Gradients */
  --gradient-start: var(--color-primary);
  --gradient-end: var(--color-accent);
}
```

#### Dark Theme Tokens (dark.css)

```css
/* src/styles/tokens/dark.css */

[data-theme="dark"] {
  /* Framework Neutrals */
  --night-900: #0a0b0d;
  --night-800: #0f1117;
  --night-700: #141821;
  --night-600: #1c2230;
  --night-400: #2c3442;
  --cloud-100: #f5f7fa;
  --cloud-200: #d9e1ed;
  --cloud-400: #9aa5b5;

  /* Semantic Mapping */
  --text-primary: var(--cloud-100);
  --text-secondary: var(--cloud-200);
  --text-muted: var(--cloud-400);

  --bg-surface: var(--night-800);
  --bg-elevated: var(--night-700);
  --bg-elevated-2: var(--night-600);

  --border: var(--night-400);

  /* Semantic Colors - Brighter for dark mode */
  --color-primary: #3b82f6;
  --color-accent: #60a5fa;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #38bdf8;

  /* Interactive States */
  --link: var(--color-accent);
  --link-hover: var(--color-primary);
  --ring: rgba(96, 165, 250, 0.55);

  /* Shadows - Darker for depth */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.5);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.6), 0 4px 6px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.7), 0 10px 10px rgba(0, 0, 0, 0.6);

  /* Overlay */
  --overlay: rgba(5, 7, 10, 0.65);

  /* Selection */
  --selection-bg: rgba(96, 165, 250, 0.25);
  --selection-text: var(--text-primary);

  /* Gradients */
  --gradient-start: var(--color-primary);
  --gradient-end: var(--color-accent);
}
```

#### High-Contrast Theme Tokens (high-contrast.css)

```css
/* src/styles/tokens/high-contrast.css */

[data-theme="high-contrast"] {
  /* Extreme Contrast */
  --text-primary: #000000;
  --text-secondary: #000000;
  --text-muted: #333333;

  --bg-surface: #ffffff;
  --bg-elevated: #ffffff;
  --bg-elevated-2: #f0f0f0;

  --border: #000000;

  /* Semantic Colors - Web-safe high-contrast */
  --color-primary: #0000ee; /* Classic blue link */
  --color-accent: #0000ee;
  --color-success: #008000; /* Green */
  --color-warning: #ffa500; /* Orange */
  --color-danger: #cc0000; /* Red */
  --color-info: #0000ee;

  /* Interactive States */
  --link: #0000ee;
  --link-hover: #0000ee;
  --ring: rgba(0, 0, 238, 0.5);

  /* Shadows - Minimal, use borders instead */
  --shadow-xs: 0 0 0 1px rgba(0, 0, 0, 0.2);
  --shadow-sm: 0 0 0 1px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 0 0 2px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 0 0 2px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 0 0 3px rgba(0, 0, 0, 0.6);

  /* Overlay */
  --overlay: rgba(0, 0, 0, 0.8);

  /* Selection */
  --selection-bg: #ffff00; /* Yellow highlight */
  --selection-text: #000000;

  /* Gradients - Disabled in high-contrast */
  --gradient-start: var(--color-primary);
  --gradient-end: var(--color-primary);
}
```

### 3. Component Migration Plan

#### App.css Changes (Remove all color definitions, use tokens)

**BEFORE (lines 10-26):**

```css
:root {
  --color-mint: #98d8c8;
  --color-cyan: #6fc2db;
  /* ... */
  --text-primary: #111827;
}
```

**AFTER:**

```css
/* All color definitions removed - see src/styles/tokens/ */

:root {
  /* UI Scale - user preference */
  --ui-scale: 1;

  /* Computed responsive fonts (keep this logic) */
  --font-xs: calc(var(--text-xs) * var(--ui-scale));
  --font-sm: calc(var(--text-sm) * var(--ui-scale));
  --font-base: calc(var(--text-base) * var(--ui-scale));
  --font-md: calc(var(--text-lg) * var(--ui-scale));
  --font-lg: calc(var(--text-xl) * var(--ui-scale));
  --font-xl: calc(var(--text-4xl) * var(--ui-scale));

  /* Sidebar widths (app-specific, keep here) */
  --sidebar-width: clamp(150px, 20vw, 200px);
  --sidebar-collapsed-width: 50px;

  /* Typography */
  font-family: var(--font-body);
  font-size: var(--font-base);
  line-height: 1.5;
  color: var(--text-primary);
}
```

#### Card Component Fix (CRITICAL)

**File:** `src/App.css` lines 492-570

**BEFORE (line 493):**

```css
.card {
  background: white; /* ← HARDCODED, breaks dark mode */
  /* ... */
  color: #111827; /* ← HARDCODED */
}
```

**AFTER:**

```css
.card {
  background: var(--bg-surface); /* ← Respects theme */
  border-radius: var(--radius-sm);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition:
    transform var(--duration-base) var(--ease-out),
    box-shadow var(--duration-base) var(--ease-out);
  border-left: 4px solid var(--border);
  color: var(--text-primary); /* ← Respects theme */
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card-title {
  font-weight: 600;
  font-size: var(--font-base);
  color: var(--text-primary); /* ← Not hardcoded */
  margin-bottom: var(--space-2);
}

.card-description {
  font-size: var(--font-sm);
  color: var(--text-secondary); /* ← Not hardcoded */
  line-height: 1.4;
}

.card-tags {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-3);
  flex-wrap: wrap;
}

.card-tag {
  font-size: var(--font-xs);
  padding: 2px 6px;
  background: var(--bg-elevated-2);
  border-radius: 3px;
  color: var(--text-muted);
  white-space: nowrap;
}
```

#### Button Updates

**BEFORE (line 159-165):**

```css
button.primary {
  background: var(--color-cyan); /* ← Product color */
  color: white;
}

button.primary:hover {
  background: #5ab0c9; /* ← Hardcoded */
}
```

**AFTER:**

```css
button.primary {
  background: var(--color-primary);
  color: var(--white);
}

button.primary:hover {
  background: var(--color-accent);
}
```

#### Focus States

**BEFORE (line 435):**

```css
.column-title-input:focus {
  border-color: var(--color-cyan);
  box-shadow: 0 0 0 2px rgba(111, 194, 219, 0.2); /* ← Hardcoded */
}
```

**AFTER:**

```css
.column-title-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--ring);
}
```

#### Error States

**BEFORE (line 877, 881):**

```css
.error-text {
  color: #f43f5e; /* ← Hardcoded */
}

.form-input.invalid {
  border-color: #f43f5e; /* ← Hardcoded */
}
```

**AFTER:**

```css
.error-text {
  color: var(--color-danger);
}

.form-input.invalid {
  border-color: var(--color-danger);
}
```

### 4. TypeScript Changes

#### Update PREDEFINED_COLORS (src/state/types.ts)

**BEFORE (lines 102-108):**

```typescript
export const PREDEFINED_COLORS = {
  mint: "#98d8c8",
  cyan: "#6fc2db",
  salmon: "#f88379",
  lavender: "#b4a7d6",
  slate: "#8d99ae",
} as const;
```

**AFTER:**

```typescript
// Semantic colors from tokens (used for column/card colors)
export const PREDEFINED_COLORS = {
  primary: "var(--color-primary)",
  accent: "var(--color-accent)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  info: "var(--color-info)",
} as const;

// Legacy color names for backward compatibility
export const LEGACY_COLOR_MAP = {
  cyan: "var(--color-primary)",
  mint: "var(--color-success)",
  salmon: "var(--color-danger)",
  lavender: "var(--color-accent)",
  slate: "var(--border)",
} as const;
```

#### Update ColorPicker Component

**File:** `src/ui/ColorPicker.tsx` lines 12-19

**BEFORE:**

```typescript
const QUICK_SWATCHES = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#a855f7", "#f43f5e"];
```

**AFTER:**

```typescript
// Use semantic colors from tokens
const QUICK_SWATCHES = [
  { name: "Primary", value: "var(--color-primary)" },
  { name: "Accent", value: "var(--color-accent)" },
  { name: "Success", value: "var(--color-success)" },
  { name: "Warning", value: "var(--color-warning)" },
  { name: "Info", value: "var(--color-info)" },
  { name: "Danger", value: "var(--color-danger)" },
];
```

**Note:** ColorPicker needs refactoring to handle CSS variables. See implementation steps below.

---

## Implementation Steps

### Step 1: Create Token Files (Day 1, Morning)

**Duration:** 1-2 hours

1. Create directory structure:

   ```bash
   mkdir -p src/styles/tokens
   ```

2. Create `src/styles/tokens/base.css` with spacing, radius, typography, motion, icon sizes (copy from Proposed Changes section above)

3. Create `src/styles/tokens/light.css` with light theme colors (copy from above)

4. Create `src/styles/tokens/dark.css` with dark theme colors (copy from above)

5. Create `src/styles/tokens/high-contrast.css` with high-contrast theme (copy from above)

6. Create `src/styles/index.css`:

   ```css
   /* Import all token files */
   @import "./tokens/base.css";
   @import "./tokens/light.css";
   @import "./tokens/dark.css";
   @import "./tokens/high-contrast.css";
   ```

7. Update `src/main.tsx` (line 3):

   ```typescript
   // BEFORE
   import "./App.css";

   // AFTER
   import "./styles/index.css";
   import "./App.css"; // Keep for component styles
   ```

**Verification:** Check browser DevTools → Elements → Computed styles, should see all new CSS variables.

---

### Step 2: Update App.css Color Variables (Day 1, Afternoon)

**Duration:** 2 hours

**File:** `src/App.css`

1. **Remove** lines 10-26 (light theme color definitions)
2. **Remove** lines 64-76 (dark theme color definitions)
3. **Keep** lines 40-49 (UI scale computed fonts)
4. **Keep** lines 51-53 (sidebar widths)

5. **Update** root block (lines 9-62):

   ```css
   :root {
     /* UI Scale - user-configurable */
     --ui-scale: 1;

     /* Responsive fonts with scale multiplier */
     --font-xs: calc(var(--text-xs) * var(--ui-scale));
     --font-sm: calc(var(--text-sm) * var(--ui-scale));
     --font-base: calc(var(--text-base) * var(--ui-scale));
     --font-md: calc(var(--text-lg) * var(--ui-scale));
     --font-lg: calc(var(--text-xl) * var(--ui-scale));
     --font-xl: calc(var(--text-4xl) * var(--ui-scale));

     /* Sidebar (app-specific) */
     --sidebar-width: clamp(150px, 20vw, 200px);
     --sidebar-collapsed-width: 50px;

     /* Typography */
     font-family: var(--font-body);
     font-size: var(--font-base);
     line-height: 1.5;
     color: var(--text-primary);
   }
   ```

6. **Remove** entire `[data-theme="dark"]` block (lines 64-76) - handled by token files now

**Verification:** App should still render (might have color issues, that's expected at this stage).

---

### Step 3: Fix Card Component (Day 1, Late Afternoon)

**Duration:** 1 hour

**File:** `src/App.css` lines 492-570

**CRITICAL:** This fixes cards being white in dark mode.

1. Update `.card` class (lines 492-512):

   ```css
   .card {
     background: var(--bg-surface);
     border-radius: var(--radius-sm);
     padding: var(--space-4);
     box-shadow: var(--shadow-sm);
     cursor: pointer;
     transition:
       transform var(--duration-base) var(--ease-out),
       box-shadow var(--duration-base) var(--ease-out);
     border-left: 4px solid var(--border);
     color: var(--text-primary);
   }

   .card:hover {
     transform: translateY(-2px);
     box-shadow: var(--shadow-md);
   }
   ```

2. Update `.card-title` (lines 534-542):

   ```css
   .card-title {
     font-weight: 600;
     font-size: var(--font-base);
     color: var(--text-primary);
     margin-bottom: var(--space-2);
   }
   ```

3. Update `.card-description` (lines 544-554):

   ```css
   .card-description {
     font-size: var(--font-sm);
     color: var(--text-secondary);
     line-height: 1.4;
     display: -webkit-box;
     -webkit-line-clamp: 2;
     -webkit-box-orient: vertical;
     overflow: hidden;
   }
   ```

4. Update `.card-tag` (lines 562-570):
   ```css
   .card-tag {
     font-size: var(--font-xs);
     padding: 2px 6px;
     background: var(--bg-elevated-2);
     border-radius: 3px;
     color: var(--text-muted);
     white-space: nowrap;
   }
   ```

**Verification:** Cards should now respect dark mode. Toggle theme and check card backgrounds change.

---

### Step 4: Replace All Hardcoded Colors (Day 2, Morning)

**Duration:** 3 hours

**Strategy:** Search and replace all hex colors and product color variables.

**App.css Replacements:**

1. **Primary buttons** (lines 158-165):

   ```css
   /* FIND */
   background: var(--color-cyan);
   /* REPLACE WITH */
   background: var(--color-primary);

   /* FIND */
   background: #5ab0c9;
   /* REPLACE WITH */
   background: var(--color-accent);
   ```

2. **Slider thumbs** (lines 190, 198):

   ```css
   /* FIND */
   background: var(--color-cyan);
   /* REPLACE WITH */
   background: var(--color-primary);
   ```

3. **Active board item** (line 293):

   ```css
   /* FIND */
   background: var(--color-cyan);
   /* REPLACE WITH */
   background: var(--color-primary);
   ```

4. **Add column hover** (lines 388-389):

   ```css
   /* FIND */
   border-color: var(--color-cyan);
   color: var(--color-cyan);
   /* REPLACE WITH */
   border-color: var(--color-primary);
   color: var(--color-primary);
   ```

5. **Focus states** (lines 424, 434-435, 852, 900, 1012):

   ```css
   /* FIND */
   border-color: var(--color-cyan);
   box-shadow: 0 0 0 2px rgba(111, 194, 219, 0.2);
   /* REPLACE WITH */
   border-color: var(--color-primary);
   box-shadow: 0 0 0 2px var(--ring);

   /* FIND */
   outline: 2px solid var(--color-cyan);
   /* REPLACE WITH */
   outline: 2px solid var(--ring);
   ```

6. **Error states** (lines 757-758, 877, 881, 948):

   ```css
   /* FIND */
   background: #ffe5e5;
   color: #d32f2f;
   /* REPLACE WITH */
   background: rgba(var(--color-danger), 0.1); /* Or use a danger-bg token */
   color: var(--color-danger);

   /* FIND */
   color: #f43f5e;
   border-color: #f43f5e;
   /* REPLACE WITH */
   color: var(--color-danger);
   border-color: var(--color-danger);
   ```

**Header.tsx Replacements:**

File: `src/ui/Header.tsx` line 19

```typescript
// FIND
color: "var(--color-salmon)";

// REPLACE WITH
color: "var(--color-danger)";
```

**SettingsModal.tsx Replacements:**

File: `src/ui/SettingsModal.tsx` lines 103-104, 120-121

```typescript
// FIND
borderBottom: "2px solid var(--color-cyan)",
color: "var(--color-cyan)",

// REPLACE WITH
borderBottom: "2px solid var(--color-primary)",
color: "var(--color-primary)",
```

**ImportModal.tsx Replacements:**

File: `src/ui/ImportModal.tsx` lines 196-197

```typescript
// FIND
background: "#ffe5e5",
color: "#d32f2f",

// REPLACE WITH
background: "var(--bg-elevated-2)",
color: "var(--color-danger)",
```

**Verification:** Use VSCode search (`Ctrl+Shift+F`):

- Search for `#[0-9a-fA-F]{3,6}` (regex) → Should find 0 results in component files
- Search for `var(--color-cyan)` → Should find 0 results
- Search for `var(--color-salmon)` → Should find 0 results

---

### Step 5: Update PREDEFINED_COLORS Type (Day 2, Afternoon)

**Duration:** 30 minutes

**File:** `src/state/types.ts` lines 102-108

```typescript
// REPLACE ENTIRE BLOCK

// Semantic colors from design tokens
export const PREDEFINED_COLORS = {
  primary: "#2563EB", // Resolved value for color picker
  accent: "#3B82F6",
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
  info: "#0284C7",
} as const;

// Legacy color names map to new semantic colors
export const LEGACY_COLOR_MAP: Record<string, keyof typeof PREDEFINED_COLORS> = {
  cyan: "primary",
  mint: "success",
  salmon: "danger",
  lavender: "accent",
  slate: "info",
} as const;

export type PredefinedColorName = keyof typeof PREDEFINED_COLORS;
```

**Verification:** TypeScript should compile without errors.

---

### Step 6: Refactor ColorPicker Component (Day 2, Late Afternoon)

**Duration:** 1.5 hours

**File:** `src/ui/ColorPicker.tsx`

**Problem:** ColorPicker uses `<input type="color">` which doesn't support CSS variables. Need resolved hex values.

**Solution:**

1. Update QUICK_SWATCHES (lines 12-19):

   ```typescript
   import { PREDEFINED_COLORS } from "@state/types";

   const QUICK_SWATCHES = [
     { name: "Primary", value: PREDEFINED_COLORS.primary },
     { name: "Accent", value: PREDEFINED_COLORS.accent },
     { name: "Success", value: PREDEFINED_COLORS.success },
     { name: "Warning", value: PREDEFINED_COLORS.warning },
     { name: "Info", value: PREDEFINED_COLORS.info },
     { name: "Danger", value: PREDEFINED_COLORS.danger },
   ];
   ```

2. Update swatch rendering to show name on hover:
   ```tsx
   {
     QUICK_SWATCHES.map((swatch) => (
       <button
         key={swatch.value}
         type="button"
         className="quick-swatch"
         style={{ backgroundColor: swatch.value }}
         onClick={() => setColor(swatch.value)}
         title={swatch.name} // ← Add tooltip
         aria-label={`${swatch.name} color`}
       />
     ));
   }
   ```

**Verification:** Color picker shows 6 semantic color swatches with tooltips.

---

### Step 7: Add High-Contrast Theme Support (Day 3, Morning)

**Duration:** 2 hours

**Files to Modify:**

- `src/App.tsx`
- `src/utils/theme.ts`
- `src/ui/SettingsModal.tsx`

#### 7.1 Update Theme Type

**File:** `src/utils/theme.ts` line 3

```typescript
// BEFORE
export type Theme = "light" | "dark";

// AFTER
export type Theme = "light" | "dark" | "high-contrast";
```

#### 7.2 Update Theme Detection

**File:** `src/utils/theme.ts` lines 8-15

```typescript
export function detectInitialTheme(): Theme {
  const saved = localStorage.getItem("chronica.theme") as Theme | null;
  if (saved && ["light", "dark", "high-contrast"].includes(saved)) {
    return saved;
  }
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  // Check for high-contrast preference
  if (window.matchMedia && window.matchMedia("(prefers-contrast: more)").matches) {
    return "high-contrast";
  }
  return "light";
}
```

#### 7.3 Add Theme Selector to Settings

**File:** `src/ui/SettingsModal.tsx`

Add after dark mode toggle (around line 150):

```tsx
{
  /* Theme Selector */
}
<div className="form-group">
  <label className="form-label">Theme</label>
  <select className="form-select" value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
    <option value="light">Light</option>
    <option value="dark">Dark</option>
    <option value="high-contrast">High Contrast</option>
  </select>
  <p
    style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: "var(--space-2)" }}
  >
    High contrast mode improves accessibility for users with visual impairments.
  </p>
</div>;
```

**Note:** Remove the old "Dark mode" checkbox, replace with dropdown.

**Verification:**

1. Settings modal shows theme dropdown
2. Selecting "High Contrast" applies high-contrast.css tokens
3. UI has maximum contrast (black text on white, strong borders)

---

### Step 8: Update Spacing to Fixed Values (Day 3, Afternoon)

**Duration:** 1 hour

**File:** `src/App.css` lines 28-34

**BEFORE:**

```css
--spacing-xs: clamp(3px, 0.4vw, 4px);
--spacing-sm: clamp(6px, 0.8vw, 8px);
--spacing-md: clamp(12px, 1.6vw, 16px);
--spacing-lg: clamp(18px, 2.4vw, 24px);
--spacing-xl: clamp(24px, 3.2vw, 32px);
```

**AFTER:**

```css
/* Removed - use tokens from base.css instead */
/* All components should use --space-* tokens directly */
```

**Component Updates:**

Search for `var(--spacing-` and replace with `var(--space-`:

- `--spacing-xs` → `--space-1`
- `--spacing-sm` → `--space-2`
- `--spacing-md` → `--space-4`
- `--spacing-lg` → `--space-6`
- `--spacing-xl` → `--space-8`

**Verification:**

- Spacing remains consistent across all screen sizes
- No fluid spacing, all fixed 4px increments

---

### Step 9: Comprehensive Testing (Day 3, Late Afternoon)

**Duration:** 2 hours

See [Testing Checklist](#testing-checklist) section below.

---

## Files to Modify

### New Files to Create

1. `src/styles/tokens/base.css` (~100 lines)
2. `src/styles/tokens/light.css` (~80 lines)
3. `src/styles/tokens/dark.css` (~80 lines)
4. `src/styles/tokens/high-contrast.css` (~70 lines)
5. `src/styles/index.css` (~10 lines)

**Total New Lines:** ~340 lines

### Files to Modify (with line ranges)

1. **`src/main.tsx`** (1 line change)
   - Line 3: Add styles import

2. **`src/App.css`** (~150 line changes)
   - Lines 10-26: Remove (light theme colors)
   - Lines 28-34: Remove (fluid spacing)
   - Lines 64-76: Remove (dark theme block)
   - Lines 158-165: Update (primary button)
   - Lines 190, 198: Update (slider)
   - Line 293: Update (active board)
   - Lines 388-389: Update (add column hover)
   - Lines 424, 434-435: Update (focus states)
   - Lines 486-487: Update (add card hover)
   - Lines 492-570: Update (card styles) **CRITICAL**
   - Lines 757-758: Update (danger hover)
   - Lines 852, 900, 1012: Update (focus outlines)
   - Lines 877, 881: Update (error states)
   - Line 948: Update (destructive menu)
   - Line 968: Update (overflow menu check)

3. **`src/state/types.ts`** (~20 line changes)
   - Lines 102-108: Replace PREDEFINED_COLORS definition
   - Add LEGACY_COLOR_MAP

4. **`src/ui/ColorPicker.tsx`** (~30 line changes)
   - Lines 12-19: Update QUICK_SWATCHES
   - Update swatch rendering logic

5. **`src/ui/Header.tsx`** (1 line change)
   - Line 19: Replace salmon with danger

6. **`src/ui/SettingsModal.tsx`** (~20 line changes)
   - Lines 103-104, 120-121: Replace cyan with primary
   - Add theme selector dropdown

7. **`src/ui/ImportModal.tsx`** (2 line changes)
   - Lines 196-197: Replace hardcoded colors

8. **`src/utils/theme.ts`** (~10 line changes)
   - Line 3: Update Theme type
   - Lines 8-15: Update detectInitialTheme()

**Total Modified Lines:** ~235 lines across 8 files

---

## Dependencies & Side Effects

### Dependencies (Must Complete First)

1. **None** - This is a foundational change

### Side Effects (Will Be Affected)

1. **Column Color Mode Feature** (separate feature doc)
   - Will use new token system
   - Must implement AFTER style guide migration
   - Affects `getColumnColorStyles()` function

2. **Export/Import** (separate feature doc)
   - May need to handle legacy color names
   - LEGACY_COLOR_MAP provides migration path
   - Old exports with "cyan" should map to "primary"

3. **Card Fields** (already implemented)
   - CardEditor will respect new theme tokens
   - No breaking changes

4. **User Data Migration**
   - Board files may reference old color names ("cyan", "mint", etc.)
   - Import logic must map legacy names using LEGACY_COLOR_MAP
   - See Migration Notes section

---

## Testing Checklist

### Automated Tests

- [ ] TypeScript compiles without errors
- [ ] ESLint passes with 0 errors
- [ ] Prettier formatting passes
- [ ] All existing tests pass (run `pnpm test`)

### Visual Regression Testing

#### Light Theme

- [ ] App background is `#FFFFFF` (white)
- [ ] Text is `#0B0C10` (Ink 900)
- [ ] Cards have white background with proper shadows
- [ ] Buttons use `#2563EB` (primary blue)
- [ ] Hover states work (button darkens to `#3B82F6`)
- [ ] Focus rings are visible (blue ring)
- [ ] Error messages are red (`#DC2626`)
- [ ] Borders are `#CBD4DF` (Mist 400)

#### Dark Theme

- [ ] App background is `#0F1117` (Night 800)
- [ ] Text is `#F5F7FA` (Cloud 100)
- [ ] Cards have `#141821` background (Night 700)
- [ ] Cards are readable (not white anymore)
- [ ] Buttons use `#3B82F6` (lighter primary)
- [ ] Shadows are darker (more pronounced)
- [ ] Focus rings are visible (lighter blue)
- [ ] All borders visible against dark background

#### High-Contrast Theme

- [ ] Maximum contrast (black on white)
- [ ] All text is `#000000`
- [ ] All backgrounds are `#FFFFFF` or `#F0F0F0`
- [ ] Links are `#0000EE` (classic blue)
- [ ] Buttons have strong borders
- [ ] No gradients or subtle effects
- [ ] Focus rings are thick and visible
- [ ] Selection highlight is yellow (`#FFFF00`)

### Component Testing

#### Cards

- [ ] Card background respects theme (not always white)
- [ ] Card text readable in all 3 themes
- [ ] Card hover effects work
- [ ] Card tags have proper contrast
- [ ] Card border colors work with column colors

#### Buttons

- [ ] Primary buttons use primary color
- [ ] Hover states work
- [ ] Disabled states visible
- [ ] Icon buttons have proper hit area (44x44px minimum)

#### Inputs & Forms

- [ ] Focus states visible in all themes
- [ ] Error states show danger color
- [ ] Placeholders readable
- [ ] Form labels proper contrast

#### Modals

- [ ] Modal backgrounds respect theme
- [ ] Modal text readable
- [ ] Overlay darkness appropriate for theme
- [ ] Close buttons visible

#### Color Picker

- [ ] Shows 6 semantic color swatches
- [ ] Swatches have tooltips (Primary, Accent, etc.)
- [ ] Selected color preview works
- [ ] Hex input validates properly

#### Settings Modal

- [ ] Theme dropdown shows 3 options
- [ ] Changing theme applies immediately
- [ ] Theme preference persists on reload
- [ ] All setting controls visible in all themes

### Accessibility Testing

- [ ] WCAG AA contrast ratios met (4.5:1 normal, 3:1 large)
- [ ] Focus indicators visible on all interactive elements
- [ ] Keyboard navigation works
- [ ] Screen reader announces theme changes
- [ ] High-contrast mode passes contrast checker
- [ ] No information conveyed by color alone

### Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (if available)

### Performance Testing

- [ ] No visual jank during theme switch
- [ ] CSS variables resolve quickly
- [ ] No FOUC (flash of unstyled content)
- [ ] File size impact acceptable (<10KB additional CSS)

---

## Success Criteria

### Definition of Done

1. **Zero Hardcoded Colors**
   - No `#` hex values in component files
   - No product colors (cyan, mint, salmon) in CSS
   - All colors reference CSS variables

2. **Three Working Themes**
   - Light theme matches Stack Junkie spec
   - Dark theme matches Stack Junkie spec
   - High-contrast theme meets WCAG AAA

3. **Card Component Fixed**
   - Cards respect current theme
   - Cards readable in dark mode
   - No white cards on dark background

4. **Token System Complete**
   - All 8 token categories implemented (colors, spacing, radius, shadows, typography, motion, icons, semantic)
   - Tokens match Stack Junkie guide exactly
   - Token files organized and maintainable

5. **Accessibility Improved**
   - High-contrast mode fully functional
   - All contrast ratios meet WCAG AA minimum
   - Focus states visible in all themes

6. **Backward Compatibility**
   - Legacy color names map to new semantic colors
   - Existing board files load correctly
   - No user data loss

7. **No Regressions**
   - All existing features work
   - No visual bugs introduced
   - Performance maintained

---

## Migration Notes

### Handling Legacy Board Data

**Problem:** Existing board files may contain old color names:

- "cyan", "mint", "salmon", "lavender", "slate"

**Solution:** Import logic with fallback mapping

**File:** `src/io/importExport.ts`

Add migration function:

```typescript
import { LEGACY_COLOR_MAP, PREDEFINED_COLORS } from "@state/types";

/**
 * Migrate legacy color names to semantic tokens
 */
function migrateColorName(color: string | undefined): string | undefined {
  if (!color) return undefined;

  // Check if it's a legacy color name
  if (color in LEGACY_COLOR_MAP) {
    const newColorKey = LEGACY_COLOR_MAP[color as keyof typeof LEGACY_COLOR_MAP];
    return PREDEFINED_COLORS[newColorKey];
  }

  // Return as-is (hex color or already migrated)
  return color;
}
```

Use in `normalizeColor()` function (line 14):

```typescript
function normalizeColor(color?: string): string | undefined {
  if (!color) return undefined;

  // Migrate legacy names
  color = migrateColorName(color) ?? color;

  // Rest of existing logic...
}
```

**Verification:**

1. Export a board with old color names
2. Edit JSON to use "cyan", "mint", etc.
3. Import the board
4. Colors should map correctly to new semantic colors

### User Communication

**Changelog Entry:**

```markdown
## [0.2.0] - 2025-XX-XX

### Changed

- **BREAKING:** Migrated to Stack Junkie Universal Style Guide v0.3
- Color system now uses semantic tokens (primary, accent, success, warning, danger, info)
- Legacy color names (cyan, mint, salmon, lavender, slate) automatically migrate to semantic equivalents
- Cards now respect dark mode (no longer always white)
- Added high-contrast theme for accessibility

### Added

- Three theme options: Light, Dark, High Contrast
- Comprehensive design token system for colors, spacing, typography, and more
- Theme selector in Settings → Appearance

### Fixed

- Cards were unreadable in dark mode (always white background)
- Inconsistent color usage across components
- Missing focus indicators in some themes
```

**Migration Guide for Users:**

> **Note:** After updating to v0.2.0, your existing boards will continue to work. Any custom colors you set will automatically migrate to the new color system. If you notice any visual changes, please try switching themes in Settings → Appearance.

---

## Rollback Plan

### If Migration Fails

**Symptoms:**

- App won't load
- Colors completely broken
- TypeScript errors blocking build

**Rollback Steps:**

1. **Revert Token Files:**

   ```bash
   git checkout HEAD -- src/styles/
   rm -rf src/styles/tokens/
   ```

2. **Revert Main CSS:**

   ```bash
   git checkout HEAD -- src/App.css
   ```

3. **Revert Component Files:**

   ```bash
   git checkout HEAD -- src/ui/Header.tsx
   git checkout HEAD -- src/ui/SettingsModal.tsx
   git checkout HEAD -- src/ui/ImportModal.tsx
   git checkout HEAD -- src/ui/ColorPicker.tsx
   ```

4. **Revert Type Definitions:**

   ```bash
   git checkout HEAD -- src/state/types.ts
   git checkout HEAD -- src/utils/theme.ts
   ```

5. **Revert Main Entry:**

   ```bash
   git checkout HEAD -- src/main.tsx
   ```

6. **Rebuild:**
   ```bash
   pnpm install
   pnpm build
   ```

### Partial Rollback (Keep Tokens, Revert Components)

If tokens work but components broken:

1. Keep token files
2. Revert individual component files
3. Fix incrementally

### Safe Checkpoint Strategy

**Before starting:**

```bash
git checkout -b feature/style-guide-migration
git commit -m "Checkpoint: Before style guide migration"
```

**After each step:**

```bash
git add .
git commit -m "Step X: [description]"
```

**If Step X breaks:**

```bash
git reset --hard HEAD~1  # Undo last commit
```

---

## Additional Resources

### Stack Junkie Style Guide

- **Location:** `docs/stack-junkie-style-guide.md`
- **Sections to Reference:**
  - Section 4: Color System
  - Section 5: Typography
  - Section 6: Layout and Spacing
  - Section 7: Radius and Shadows
  - Section 14: Design Tokens JSON
  - Section 15: CSS Variables Output

### Contrast Checker Tools

- **WebAIM:** https://webaim.org/resources/contrastchecker/
- **Colorable:** https://colorable.jxnblk.com/
- **Contrast Ratio:** https://contrast-ratio.com/

### CSS Variables Resources

- **MDN:** https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
- **Data Theme Attribute:** https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/data-*

### Testing Tools

- **Axe DevTools:** Browser extension for accessibility testing
- **WAVE:** Web accessibility evaluation tool
- **Lighthouse:** Chrome DevTools audit

---

## Questions & Troubleshooting

### Q: Why not use Tailwind CSS?

**A:** Chronica uses vanilla CSS with CSS variables for maximum control and minimal bundle size. Tailwind integration is possible (see Section 16 of style guide), but not required for this migration.

### Q: What if I want different brand colors?

**A:** Modify `src/styles/tokens/light.css` and `dark.css`:

```css
--color-primary: #YOUR_COLOR;
--color-accent: #YOUR_ACCENT;
```

All components will automatically use new colors.

### Q: How do I add a new theme (e.g., "midnight")?

**A:**

1. Create `src/styles/tokens/midnight.css`
2. Define all color tokens with `[data-theme="midnight"]` selector
3. Update `Theme` type in `theme.ts`
4. Add option to Settings dropdown

### Q: Cards still white in dark mode after migration?

**A:** Check line 493 of `App.css`:

```css
/* WRONG */
.card {
  background: white;
}

/* CORRECT */
.card {
  background: var(--bg-surface);
}
```

### Q: Focus rings not visible?

**A:** Ensure all interactive elements use `var(--ring)`:

```css
button:focus {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

### Q: Colors look washed out in dark mode?

**A:** Dark theme uses brighter semantic colors intentionally (e.g., `#3B82F6` instead of `#2563EB`). This provides better contrast on dark backgrounds. Adjust in `dark.css` if needed.

---

**End of FEATURE-STYLE-GUIDE-ALIGNMENT.md**

**Last Updated:** 2025-11-03
**Author:** Claude Code
**Version:** 1.0
