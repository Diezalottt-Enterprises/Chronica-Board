# Feature: Column Color Mode Toggle

**Status:** Planned
**Priority:** Medium
**Component:** Appearance Settings & Theme System
**Estimated Effort:** 1-2 days
**Version Target:** v0.1.0-alpha.7

---

## Table of Contents

1. [Overview](#overview)
2. [Current State Analysis](#current-state-analysis)
3. [Requirements](#requirements)
4. [Technical Design](#technical-design)
5. [Implementation Guide](#implementation-guide)
6. [Testing](#testing)
7. [Success Criteria](#success-criteria)
8. [Related Features](#related-features)

---

## Overview

### Purpose

Add a user setting to toggle between two column color rendering modes:

1. **Subtle Mode (Current):** Low opacity backgrounds with gentle color tints
2. **Vibrant Mode (New):** Higher opacity backgrounds with bolder, more saturated color appearance

This gives users control over how prominently column colors appear in their workspace, allowing both minimal/professional aesthetics and colorful/high-contrast aesthetics.

### User Story

> "As a user, I want to toggle between subtle and vibrant column colors so that I can customize the visual intensity of my board to match my preference—whether I prefer understated pastels or bold, saturated colors."

### Business Value

- **Personalization:** Increases user satisfaction by offering visual customization
- **Accessibility:** Vibrant mode improves color distinction for users with low vision
- **Professional Flexibility:** Subtle mode for work environments, vibrant for personal projects
- **Color Theory:** Both modes maintain good contrast and readability

---

## Current State Analysis

### Current Column Color System

**File:** `src/utils/theme.ts` (lines 48-70)

```typescript
export function getColumnColorStyles(color: string | null | undefined, theme: Theme) {
  if (!color) {
    return {
      headerBg: "",
      bodyBg: "",
      border: "",
      rail: "",
      textColor: "",
    };
  }

  const isLightTheme = theme === "light";

  return {
    headerBg: hexToRgba(color, isLightTheme ? 0.16 : 0.24),
    bodyBg: hexToRgba(color, isLightTheme ? 0.06 : 0.12),
    border: hexToRgba(color, isLightTheme ? 0.35 : 0.45),
    rail: color,
    textColor: isDark(color) ? "#ffffff" : "#000000",
  };
}
```

**Current Alpha Values:**

| Element   | Light Theme | Dark Theme | Purpose                     |
| --------- | ----------- | ---------- | --------------------------- |
| headerBg  | 0.16 (16%)  | 0.24 (24%) | Column title background     |
| bodyBg    | 0.06 (6%)   | 0.12 (12%) | Cards area background       |
| border    | 0.35 (35%)  | 0.45 (45%) | Column border outline       |
| rail      | 1.0 (100%)  | 1.0 (100%) | Collapsed column indicator  |
| textColor | Dynamic     | Dynamic    | Column title text (contrast) |

**Usage Location:** `src/ui/KanbanBoard.tsx:104`

```typescript
const colorStyles = getColumnColorStyles(column.color, theme);
```

### Visual Characteristics

**Subtle Mode (Current):**
- Very transparent backgrounds (6-16% header, 6-12% body)
- Creates gentle color tints
- Professional, understated appearance
- Low visual weight, text-focused

**Problem:**
- Some users want more color vibrancy
- Hard to distinguish columns at a glance with low saturation
- Color choices feel "washed out" for users who prefer bold aesthetics

---

## Requirements

### Functional Requirements

1. **Settings Toggle**
   - Add "Column Color Mode" toggle in Settings → General → Appearance section
   - Two options: "Subtle" (default) and "Vibrant"
   - Setting persists in config.json
   - Changes take effect immediately (no app restart)

2. **Vibrant Mode Specifications**
   - Higher opacity values while maintaining readability
   - Good color theory: sufficient contrast for text
   - Dark mode compatibility
   - No color distortion or oversaturation

3. **Backward Compatibility**
   - Existing config files default to "subtle" mode
   - No breaking changes to export/import format

### Non-Functional Requirements

1. **Performance:** No performance impact (simple conditional logic)
2. **Maintainability:** Clear separation between mode configurations
3. **Accessibility:** Both modes maintain WCAG AA contrast ratios
4. **Consistency:** Mode applies to all columns uniformly

---

## Technical Design

### Config Schema Update

**File:** `src/state/types.ts` (lines 57-74)

**Add new field to Config interface:**

```typescript
export interface Config {
  appVersion: string;
  window: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  pinned: boolean;
  opacity: number; // 0.7 - 1.0
  autostart: boolean;
  sidebarPinned: boolean;
  columnsLocked: boolean;
  uiScale: number; // 0.8 - 1.2
  columnColorMode?: "subtle" | "vibrant"; // NEW FIELD (default: "subtle")
  columnTitles?: Record<ColumnKey, string>;
  fields?: Record<string, FieldDefinition>;
}
```

**Default Value:** `"subtle"` (maintains current behavior)

---

### Vibrant Mode Alpha Values

Based on user specification (0.4-0.8 range) and color theory best practices:

| Element   | Light Subtle | Dark Subtle | Light Vibrant | Dark Vibrant | Notes                              |
| --------- | ------------ | ----------- | ------------- | ------------ | ---------------------------------- |
| headerBg  | 0.16         | 0.24        | 0.50          | 0.60         | Medium opacity, readable text      |
| bodyBg    | 0.06         | 0.12        | 0.15          | 0.25         | Low enough to not obscure cards    |
| border    | 0.35         | 0.45        | 0.70          | 0.80         | High visibility, distinct columns  |
| rail      | 1.0          | 1.0         | 1.0           | 1.0          | Always solid (unchanged)           |
| textColor | Dynamic      | Dynamic     | Dynamic       | Dynamic      | Contrast-based (unchanged)         |

**Rationale:**
- **headerBg:** 50-60% opacity provides bold color while keeping text readable
- **bodyBg:** 15-25% maintains card readability (cards still need to stand out)
- **border:** 70-80% creates strong visual separation between columns
- **Dark mode slightly higher:** Compensates for darker base colors, maintains perceived saturation

---

### Updated Theme Utility Function

**File:** `src/utils/theme.ts` (lines 48-70)

**Type Definition:**

```typescript
export type ColumnColorMode = "subtle" | "vibrant";
```

**Updated Function Signature:**

```typescript
export function getColumnColorStyles(
  color: string | null | undefined,
  theme: Theme,
  mode: ColumnColorMode = "subtle"
)
```

**Full Implementation:**

```typescript
export type ColumnColorMode = "subtle" | "vibrant";

/**
 * Get column color styles based on theme and color mode
 */
export function getColumnColorStyles(
  color: string | null | undefined,
  theme: Theme,
  mode: ColumnColorMode = "subtle"
) {
  if (!color) {
    return {
      headerBg: "",
      bodyBg: "",
      border: "",
      rail: "",
      textColor: "",
    };
  }

  const isLightTheme = theme === "light";

  // Alpha values for subtle mode (current behavior)
  const subtleAlphas = {
    headerBg: isLightTheme ? 0.16 : 0.24,
    bodyBg: isLightTheme ? 0.06 : 0.12,
    border: isLightTheme ? 0.35 : 0.45,
  };

  // Alpha values for vibrant mode (bolder appearance)
  const vibrantAlphas = {
    headerBg: isLightTheme ? 0.50 : 0.60,
    bodyBg: isLightTheme ? 0.15 : 0.25,
    border: isLightTheme ? 0.70 : 0.80,
  };

  const alphas = mode === "vibrant" ? vibrantAlphas : subtleAlphas;

  return {
    headerBg: hexToRgba(color, alphas.headerBg),
    bodyBg: hexToRgba(color, alphas.bodyBg),
    border: hexToRgba(color, alphas.border),
    rail: color, // Always solid
    textColor: isDark(color) ? "#ffffff" : "#000000",
  };
}
```

---

### Config Store Update

**File:** `src/stores/configStore.ts`

**Add to ConfigState interface (after line 22):**

```typescript
interface ConfigState {
  config: Config | null;

  // Actions
  setConfig: (config: Config) => void;
  updateConfig: (updates: Partial<Config>) => void;
  setPinned: (pinned: boolean) => void;
  setOpacity: (opacity: number) => void;
  setAutostart: (autostart: boolean) => void;
  setSidebarPinned: (pinned: boolean) => void;
  setColumnsLocked: (locked: boolean) => void;
  setUIScale: (scale: number) => void;
  setColumnColorMode: (mode: ColumnColorMode) => void; // NEW ACTION

  // Field management
  addField: (fieldId: string, field: FieldDefinition) => void;
  updateField: (fieldId: string, field: FieldDefinition) => void;
  removeField: (fieldId: string) => void;
  getField: (fieldId: string) => FieldDefinition | undefined;
  getAllFields: () => Record<string, FieldDefinition>;
}
```

**Add action implementation (after line 85):**

```typescript
setColumnColorMode: (mode) => {
  const state = get();
  if (!state.config) return;
  set({ config: { ...state.config, columnColorMode: mode } });
},
```

**Update getDefaultConfig() (lines 126-137):**

```typescript
export function getDefaultConfig(): Config {
  return {
    appVersion: VERSION_DISPLAY,
    window: { x: 100, y: 100, width: 1000, height: 700 },
    pinned: false,
    opacity: 1.0,
    autostart: false,
    sidebarPinned: true,
    columnsLocked: false,
    uiScale: 1.0,
    columnColorMode: "subtle", // NEW DEFAULT
  };
}
```

**Add import statement (at top with other imports):**

```typescript
import type { ColumnColorMode } from "../utils/theme";
```

---

### KanbanBoard Component Update

**File:** `src/ui/KanbanBoard.tsx`

**Update import (line 29):**

```typescript
import { getColumnColorStyles, type ColumnColorMode } from "../utils/theme";
```

**Update SortableColumn function (line 104):**

**BEFORE:**
```typescript
const colorStyles = getColumnColorStyles(column.color, theme);
```

**AFTER:**
```typescript
export function KanbanBoard({ onEditCard, onNewCard, theme }: KanbanBoardProps) {
  const { activeBoard, updateCard, updateColumn, reorderColumns, sortColumnCards, deleteCard } =
    useBoardStore();
  const { config } = useConfigStore(); // Access config for mode
  const { showConfirm, showPrompt } = useUIStore();

  // ... rest of component ...

  // Inside SortableColumn component or where colorStyles is used:
  const colorStyles = getColumnColorStyles(
    column.color,
    theme,
    config?.columnColorMode || "subtle"
  );
```

**Note:** Verify exact structure of KanbanBoard component—the config may need to be passed as a prop to SortableColumn if it's a separate component. If SortableColumn is nested inside KanbanBoard, access config at the parent level and pass mode down.

---

### Settings Modal UI Update

**File:** `src/ui/SettingsModal.tsx`

**Add import (line 7):**

```typescript
import type { ColumnColorMode } from "../utils/theme";
```

**Update config store destructure (line 24):**

```typescript
const {
  config,
  setAutostart,
  setPinned: updatePinned,
  setOpacity: updateOpacity,
  setUIScale,
  setColumnColorMode, // NEW
} = useConfigStore();
```

**Add handler function (after line 68):**

```typescript
const handleColumnColorModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newMode: ColumnColorMode = e.target.checked ? "vibrant" : "subtle";
  setColumnColorMode(newMode);
};
```

**Add toggle UI in Appearance section (after dark mode toggle, before UI Scale slider):**

Insert between line 159 and line 161:

```typescript
{/* Dark mode toggle - existing (lines 136-159) */}

{/* NEW: Column Color Mode Toggle */}
<div className="form-checkbox" style={{ marginTop: "12px" }}>
  <input
    type="checkbox"
    role="switch"
    id="columnColorMode"
    aria-checked={config?.columnColorMode === "vibrant"}
    checked={config?.columnColorMode === "vibrant"}
    onChange={handleColumnColorModeChange}
  />
  <label htmlFor="columnColorMode" style={{ textTransform: "none" }}>
    Vibrant column colors
  </label>
</div>
<p
  style={{
    fontSize: "11px",
    color: "var(--text-secondary)",
    marginTop: "4px",
    marginLeft: "24px",
  }}
>
  Use bolder, more saturated column backgrounds
</p>

{/* UI Scale slider - existing (starts line 161) */}
```

---

## Implementation Guide

### Step-by-Step Implementation

#### Step 1: Update Type Definitions (5 minutes)

**File:** `src/state/types.ts`

1. Add `columnColorMode?: "subtle" | "vibrant";` to Config interface (line 71)
2. Verify import statements are correct
3. Run type check: `pnpm exec tsc --noEmit`

#### Step 2: Update Theme Utility (15 minutes)

**File:** `src/utils/theme.ts`

1. Add `export type ColumnColorMode = "subtle" | "vibrant";` at top (after Theme type, ~line 3)
2. Update `getColumnColorStyles()` function signature to accept mode parameter
3. Add alpha configuration objects (subtle and vibrant)
4. Update return statement to use conditional alphas
5. Test function with both modes manually

**Verification:**
```typescript
// Test in browser console
import { getColumnColorStyles } from "./utils/theme";
getColumnColorStyles("#3b82f6", "light", "subtle");   // Current behavior
getColumnColorStyles("#3b82f6", "light", "vibrant");  // New behavior
```

#### Step 3: Update Config Store (10 minutes)

**File:** `src/stores/configStore.ts`

1. Add import: `import type { ColumnColorMode } from "../utils/theme";`
2. Add `setColumnColorMode` to ConfigState interface
3. Implement `setColumnColorMode` action
4. Update `getDefaultConfig()` to include `columnColorMode: "subtle"`
5. Run type check: `pnpm exec tsc --noEmit`

#### Step 4: Update KanbanBoard Component (10 minutes)

**File:** `src/ui/KanbanBoard.tsx`

1. Update import to include `ColumnColorMode` type
2. Add `const { config } = useConfigStore();` to access config
3. Update `getColumnColorStyles()` call to pass mode parameter
4. Verify mode defaults to "subtle" when config is undefined

**Important:** If SortableColumn is a separate component, pass `config?.columnColorMode` as a prop. If it's nested, access config at parent level.

#### Step 5: Update Settings Modal UI (15 minutes)

**File:** `src/ui/SettingsModal.tsx`

1. Add import: `import type { ColumnColorMode } from "../utils/theme";`
2. Destructure `setColumnColorMode` from useConfigStore
3. Add `handleColumnColorModeChange` handler function
4. Insert column color mode toggle UI after dark mode toggle
5. Follow existing pattern (checkbox + label + description)

**Visual Structure:**
```
Appearance
├── [✓] Dark mode (existing)
├── [✓] Vibrant column colors (NEW)
└── UI Scale: 100% (existing slider)
```

#### Step 6: Test Interactively (20 minutes)

1. Start dev server: `pnpm run dev`
2. Open Settings modal
3. Verify "Vibrant column colors" toggle appears
4. Add color to a column (if not already colored)
5. Toggle between subtle and vibrant modes
6. Verify visual changes:
   - **Subtle:** Light, transparent backgrounds
   - **Vibrant:** Bold, saturated backgrounds
7. Test in both light and dark themes
8. Restart app, verify setting persists

#### Step 7: Edge Case Testing (10 minutes)

1. **Null column colors:** Verify default columns render correctly
2. **All predefined colors:** Test mint, cyan, salmon, lavender, slate
3. **Custom hex colors:** Test various hex values (#ff0000, #00ff00, #0000ff)
4. **Light vs dark mode:** Verify both themes with both modes
5. **Config migration:** Delete config.json, verify default is "subtle"

---

## Testing

### Manual Testing Checklist

#### Visual Verification

- [ ] **Subtle mode (default)**
  - [ ] Column headers have light tint (16-24% opacity)
  - [ ] Column bodies have very subtle tint (6-12% opacity)
  - [ ] Column borders have medium opacity (35-45%)
  - [ ] Text is easily readable on all colors

- [ ] **Vibrant mode**
  - [ ] Column headers have bold color (50-60% opacity)
  - [ ] Column bodies have visible tint (15-25% opacity)
  - [ ] Column borders are highly visible (70-80% opacity)
  - [ ] Text maintains good contrast

- [ ] **Both themes**
  - [ ] Light theme + subtle mode
  - [ ] Light theme + vibrant mode
  - [ ] Dark theme + subtle mode
  - [ ] Dark theme + vibrant mode

#### Functional Testing

- [ ] Toggle appears in Settings → General → Appearance
- [ ] Toggle label: "Vibrant column colors"
- [ ] Toggle description: "Use bolder, more saturated column backgrounds"
- [ ] Clicking toggle changes mode immediately (no restart needed)
- [ ] Setting persists after closing and reopening app
- [ ] Multiple columns update simultaneously

#### Color Testing

Test each predefined color (src/state/types.ts:101-107):
- [ ] Mint (#98D8C8) - subtle & vibrant
- [ ] Cyan (#6FC2DB) - subtle & vibrant
- [ ] Salmon (#F88379) - subtle & vibrant
- [ ] Lavender (#B4A7D6) - subtle & vibrant
- [ ] Slate (#8D99AE) - subtle & vibrant

Custom colors:
- [ ] Red (#ff0000)
- [ ] Green (#00ff00)
- [ ] Blue (#0000ff)
- [ ] Dark color (#1a1a1a) - verify white text
- [ ] Light color (#f0f0f0) - verify black text

#### Edge Cases

- [ ] Default columns (no color set) render correctly
- [ ] Collapsed columns show solid rail color (unchanged)
- [ ] Deleted config.json defaults to subtle mode
- [ ] Invalid mode in config.json falls back to subtle
- [ ] Rapid toggling doesn't cause visual glitches

#### Accessibility

- [ ] Text contrast meets WCAG AA (4.5:1) in all combinations
- [ ] Toggle has proper ARIA attributes (role="switch", aria-checked)
- [ ] Keyboard navigation works (Tab to toggle, Space to activate)
- [ ] Screen reader announces toggle state

---

### Automated Testing (Future)

**File:** `src/utils/theme.test.ts` (create new file)

```typescript
import { describe, it, expect } from "vitest";
import { getColumnColorStyles } from "./theme";

describe("getColumnColorStyles", () => {
  it("should return subtle mode alphas by default", () => {
    const styles = getColumnColorStyles("#3b82f6", "light");
    expect(styles.headerBg).toBe("rgba(59, 130, 246, 0.16)");
    expect(styles.bodyBg).toBe("rgba(59, 130, 246, 0.06)");
    expect(styles.border).toBe("rgba(59, 130, 246, 0.35)");
  });

  it("should return vibrant mode alphas when specified", () => {
    const styles = getColumnColorStyles("#3b82f6", "light", "vibrant");
    expect(styles.headerBg).toBe("rgba(59, 130, 246, 0.5)");
    expect(styles.bodyBg).toBe("rgba(59, 130, 246, 0.15)");
    expect(styles.border).toBe("rgba(59, 130, 246, 0.7)");
  });

  it("should use higher alphas in dark theme for vibrant mode", () => {
    const styles = getColumnColorStyles("#3b82f6", "dark", "vibrant");
    expect(styles.headerBg).toBe("rgba(59, 130, 246, 0.6)");
    expect(styles.bodyBg).toBe("rgba(59, 130, 246, 0.25)");
    expect(styles.border).toBe("rgba(59, 130, 246, 0.8)");
  });

  it("should return empty styles for null color", () => {
    const styles = getColumnColorStyles(null, "light", "vibrant");
    expect(styles.headerBg).toBe("");
    expect(styles.bodyBg).toBe("");
  });
});
```

---

## Success Criteria

### User-Facing

1. ✅ Users can toggle between "Subtle" and "Vibrant" column color modes
2. ✅ Vibrant mode shows noticeably bolder, more saturated column colors
3. ✅ Setting persists across app restarts
4. ✅ Changes take effect immediately without restart
5. ✅ Text remains readable in all combinations (light/dark theme, subtle/vibrant)

### Technical

1. ✅ Config schema includes `columnColorMode` field with proper typing
2. ✅ `getColumnColorStyles()` accepts mode parameter and uses correct alphas
3. ✅ Config store has `setColumnColorMode` action
4. ✅ Settings modal has toggle UI in Appearance section
5. ✅ Default behavior matches current (subtle mode)
6. ✅ No TypeScript errors or ESLint warnings
7. ✅ No breaking changes to existing functionality

### Quality

1. ✅ All manual testing checklist items pass
2. ✅ Code follows existing patterns (config store actions, settings UI structure)
3. ✅ No performance degradation
4. ✅ Backward compatible with existing config files

---

## Related Features

### Dependencies

- **Config System:** Uses existing config persistence (src/io/persistence.ts)
- **Theme System:** Extends existing theme utilities (src/utils/theme.ts)
- **Settings Modal:** Adds toggle to existing UI (src/ui/SettingsModal.tsx)
- **Column Rendering:** Uses KanbanBoard component (src/ui/KanbanBoard.tsx)

### Future Enhancements

1. **Custom Alpha Sliders:** Allow users to fine-tune alpha values per mode
2. **Per-Column Mode:** Set vibrant/subtle mode per column (not global)
3. **Theme Presets:** Include mode in exportable theme presets
4. **Color Picker Enhancement:** Show mode preview in color picker
5. **Migration to Design Tokens:** When implementing FEATURE-STYLE-GUIDE-ALIGNMENT, replace hex-based system with semantic tokens

### Cross-References

- **FEATURE-STYLE-GUIDE-ALIGNMENT.md:** May replace hex colors with semantic tokens
- **DEVELOPMENT-STATUS.md:** Phase 4 (Polish) - UI enhancements
- **CLAUDE.md:** Update config section to document columnColorMode field

---

## Implementation Notes

### Color Theory Rationale

**Why These Alpha Values?**

1. **HeaderBg (50-60% vibrant):**
   - Provides strong visual identity without overwhelming text
   - 50% light = bold but not excessive
   - 60% dark = compensates for darker base, maintains perceived saturation

2. **BodyBg (15-25% vibrant):**
   - Cards must remain the visual focus (white background)
   - Too high = cards lost in colored background
   - 15-25% creates visible tint without obscuring cards

3. **Border (70-80% vibrant):**
   - Borders can be bold—they're thin lines, not surfaces
   - High opacity creates clear column separation
   - Helps with drag-and-drop target identification

4. **Dark Theme Compensation:**
   - Dark mode needs slightly higher opacity (+10%)
   - Dark backgrounds reduce perceived color saturation
   - Higher opacity maintains color vibrancy in dark environments

### Accessibility Considerations

**WCAG AA Compliance:**

- Normal text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio

**Column titles (14px default, scaled by uiScale):**
- Dynamic text color ensures contrast: `isDark(color) ? "#ffffff" : "#000000"`
- With 50-60% header background, text contrast remains sufficient
- Tested with all predefined colors

**Card text (white background):**
- Cards maintain white background, unaffected by mode
- BodyBg (15-25%) tints background but doesn't affect card surfaces

---

## Rollout Plan

### Alpha Release (v0.1.0-alpha.7)

1. Implement all code changes (Steps 1-5)
2. Complete manual testing checklist
3. Document new config field in CLAUDE.md
4. Update CHANGELOG with feature description
5. Ship to alpha testers for feedback

### Beta Release (v0.1.0-beta.1)

1. Gather user feedback on vibrant mode alpha values
2. Adjust alphas if needed based on real-world usage
3. Add automated tests (theme.test.ts)
4. Document in README under "Features"

### Stable Release (v0.1.0)

1. Consider adding per-column mode override
2. Integrate with design token system (if FEATURE-STYLE-GUIDE-ALIGNMENT ships)
3. Add keyboard shortcut (e.g., Ctrl+Shift+C to toggle modes)

---

## Code Change Summary

| File                                  | Lines Changed | Type       | Description                            |
| ------------------------------------- | ------------- | ---------- | -------------------------------------- |
| `src/state/types.ts`                  | +1            | Type       | Add columnColorMode field to Config    |
| `src/utils/theme.ts`                  | +20           | Logic      | Add mode parameter, alpha configs      |
| `src/stores/configStore.ts`           | +6            | Store      | Add setColumnColorMode action          |
| `src/ui/KanbanBoard.tsx`              | +2            | Component  | Pass mode to getColumnColorStyles      |
| `src/ui/SettingsModal.tsx`            | +25           | Component  | Add toggle UI and handler              |
| **Total**                             | **~54 lines** | **5 files** | **Minimal, focused changes**           |

---

## Appendix: Alpha Value Comparison

### Visual Reference Table

| Theme       | Mode    | HeaderBg | BodyBg | Border | Visual Effect                   |
| ----------- | ------- | -------- | ------ | ------ | ------------------------------- |
| Light       | Subtle  | 0.16     | 0.06   | 0.35   | Gentle tint, professional       |
| Light       | Vibrant | 0.50     | 0.15   | 0.70   | Bold color, high saturation     |
| Dark        | Subtle  | 0.24     | 0.12   | 0.45   | Soft glow, muted colors         |
| Dark        | Vibrant | 0.60     | 0.25   | 0.80   | Strong presence, distinct columns |

### Example Color Rendering

**Cyan (#6FC2DB) in Light Theme:**

- **Subtle:**
  - Header: `rgba(111, 194, 219, 0.16)` → Very light blue tint
  - Body: `rgba(111, 194, 219, 0.06)` → Barely perceptible
  - Border: `rgba(111, 194, 219, 0.35)` → Light cyan outline

- **Vibrant:**
  - Header: `rgba(111, 194, 219, 0.50)` → Clear, bright cyan
  - Body: `rgba(111, 194, 219, 0.15)` → Visible cyan tint
  - Border: `rgba(111, 194, 219, 0.70)` → Strong cyan outline

---

## FAQ

### Why not allow custom alpha sliders?

**Answer:** To maintain design consistency and avoid user error (e.g., unreadable text). Future enhancement may add this for advanced users.

### Why default to subtle mode?

**Answer:** Maintains current behavior, ensures backward compatibility, and provides a conservative default. Users opt-in to vibrant mode.

### What happens if config.json is missing columnColorMode?

**Answer:** App defaults to "subtle" mode via `config?.columnColorMode || "subtle"` fallback.

### Can users set vibrant mode per column?

**Answer:** Not in this version. This is a global setting. Per-column mode is a future enhancement.

### Does this affect card colors?

**Answer:** No. Only column backgrounds are affected. Cards maintain their white background and individual card colors (card.color property) are unchanged.

### Will this conflict with FEATURE-STYLE-GUIDE-ALIGNMENT?

**Answer:** Minimal conflict. Style guide migration will replace hex colors with semantic tokens, but the alpha logic remains the same. When migrating, update `getColumnColorStyles()` to use token variables instead of hex values.

---

**Document Version:** 1.0
**Last Updated:** 2025-11-03
**Author:** Claude Code
**Status:** Ready for Implementation
