# Universal Style Guide v0.3 — Chris / Stack‑Junkie

> Living system for all products, sites, decks, docs, and apps. Opinionated defaults plus flexible brand layers.

**Last updated:** Nov 3, 2025  
**Status:** Active  
**Changelog:** See section 22

---

## 0) North Star

**Purpose:** Ship fast without visual chaos. One consistent Chris‑made look that flexes across projects.

**Principles:**
- **Clear.** Use plain English. Specific dates. Short paragraphs.
- **Calm.** Neutrals do most of the work. Accents used sparingly.
- **Useful.** Every element carries a job. Remove decorative noise.
- **Honest.** No fake affordances. State expectations clearly.
- **Accessible.** Contrast meets AA minimum, often AAA for body.

**Voice pillars:** Direct. Practical. Friendly not sweet. Avoid mid sentence dashes. Use short sentences. No emojis unless explicitly requested.

---

## 1) Brand Architecture

**Framework layer (universal):**
- Tokens for color, space, type, radius, shadow
- Layout rules and grid
- Typography stacks
- Motion patterns
- Icon system
- Accessibility standards

**Brand layer (per product):**
- Color accents. One to two maximum
- Logo and mark
- Illustration mood
- Product specific components
- Voice variations

**Modes:**
- Light. Default
- Dark
- High contrast. Accessibility variant

**Theme attribute contract:** `<html data-theme="light|dark|high-contrast">`  
Site controls must read and set this attribute. Components must resolve styles through tokens only.

---

## 2) Editorial Style

**Tone:** Plain English. Short paragraphs.  
**Dates:** Use absolute dates. Example. Nov 3, 2025  
**Voice:** Active voice. Example. Click Save  

**Grammar:** Oxford comma. No mid sentence dashes. One space after period.

**Formatting:** Sentence case for UI labels. Title Case for H1 and H2 in marketing. ALL CAPS only for acronyms or small data labels.

**Inclusive language:** Avoid idioms and slang. Prefer you over we in instructions. Use they or them for singular unknown. Avoid gendered language.

**Numbers:** Numerals for 10 and above. Words for one through nine. Use comma separators. Example. 1,000  
**Links:** Descriptive text. Example. View documentation  
External links open in a new tab. Include an external link icon when space allows.

---

## 3) Accessibility (A11Y)

**Contrast:** WCAG 2.2 AA minimum. 4.5:1 normal text. 3:1 large text. Target AAA for body text.  
**Typography:** Body at least 16px. Line height 1.5 to 1.7. Avoid justified text. No weights below 400.  
**Interactive:** Hit targets at least 44 by 44 px on touch. Focus rings visible in all themes. Focus order follows the visual order. Provide skip links.  
**Motion:** Respect `prefers-reduced-motion`. Essential info never conveyed by motion only. Transitions 150 to 250 ms for most cases.  
**Alternatives:** Alt text for images. Charts have summaries or data tables. Video has captions. Audio has transcripts.  
**Color:** Never encode meaning with color alone. Add icons, labels, or patterns.  
**ARIA:** Prefer semantic HTML. Add ARIA only when needed. Test with NVDA, JAWS, and VoiceOver.

---

## 4) Color System

### Framework neutrals
**Light mode:**
- Ink 900 `#0B0C10` primary text
- Ink 700 `#1F232B` secondary text
- Ink 500 `#5B6575` muted text
- Mist 100 `#F5F7FA` lightest surface
- Mist 200 `#EDF1F5` elevated surface
- Mist 400 `#CBD4DF` borders
- White `#FFFFFF` base surface

**Dark mode:**
- Night 900 `#0A0B0D` darkest
- Night 800 `#0F1117` base
- Night 700 `#141821` elevated
- Night 600 `#1C2230` raised
- Night 400 `#2C3442` borders
- Cloud 100 `#F5F7FA` primary text
- Cloud 200 `#D9E1ED` secondary text
- Cloud 400 `#9AA5B5` muted text

### Semantic tokens (light → dark values)
- `--color-primary`: `#2563EB` → `#3B82F6`
- `--color-accent`: `#3B82F6` → `#60A5FA`
- `--color-success`: `#16A34A` → `#22C55E`
- `--color-warning`: `#D97706` → `#F59E0B`
- `--color-danger`: `#DC2626` → `#EF4444`
- `--color-info`: `#0284C7` → `#38BDF8`

### Brand accents (examples)
- **Juniper Canvas Studio:** Indigo 500 `#6366F1`, Electric Blue `#3B82F6`
- **Lantern Suite:** Emerald 500 `#10B981`, Lime 400 `#A3E635`
- **VibeFixer:** Violet 500 `#8B5CF6`, Magenta 500 `#DB2777`

### Gradients
`--gradient-start` defaults to `--color-primary`. `--gradient-end` defaults to `--color-accent`.

**Rules:** Limit accents to two. Neutrals do 80 percent of the work. Always check contrast in both themes. Do not rely on color alone.

---

## 5) Typography

### Stacks
**Headings:** `Inter, Poppins, system-ui, -apple-system, sans-serif`  
Weights 600 to 800. Tracking tight from −0.02em to −0.03em  
**Body:** `Inter, system-ui, -apple-system, sans-serif`  
Weights 400 to 600. Size 16 to 18 px. Line height 1.5 to 1.7  
**Monospace:** `'JetBrains Mono', 'Fira Code', ui-monospace, monospace`

### Loading fonts
Use Google Fonts with `font-display: swap`. Subset if possible. Consider self hosting for production.

### Type scale tokens
Base 16 px.

`--text-xs` 12 px. `--text-sm` 14 px. `--text-base` 16 px. `--text-lg` 18 px. `--text-xl` 20 px. `--text-2xl` 24 px. `--text-3xl` 30 px. `--text-4xl` 36 px. `--text-5xl` 48 px. `--text-6xl` 60 px. `--text-7xl` 72 px.

**Rules:** Max line length 70 to 80 characters. Headings follow a semantic hierarchy. Sentence case for UI. True italics only for emphasis.

---

## 6) Layout and Spacing

**Base unit:** 4 px. Prefer 8 pt steps for major spacing.

Spacing tokens. `--space-0` 0. `--space-1` 4 px. `--space-2` 8 px. `--space-3` 12 px. `--space-4` 16 px. `--space-5` 20 px. `--space-6` 24 px. `--space-8` 32 px. `--space-10` 40 px. `--space-12` 48 px. `--space-16` 64 px. `--space-20` 80 px.

**Container widths:** sm 640 px. md 768 px. lg 1024 px. xl 1280 px. 2xl 1536 px.  
**Grid:** Use CSS Grid or Flexbox. Default gap is `--space-4` or `--space-6`.  
**Vertical rhythm:** Headings use `--space-4` to `--space-6` bottom margin. Paragraphs use `--space-4`. Sections use `--space-12` to `--space-16` padding.

---

## 7) Radius and Shadows

**Radius tokens:** `--radius-xs` 4 px. `--radius-sm` 6 px. `--radius-md` 8 px. `--radius-lg` 12 px. `--radius-xl` 16 px. `--radius-2xl` 24 px. `--radius-full` 9999 px.

**Shadow tokens — light mode:**
```
--shadow-xs: 0 1px 2px rgba(0,0,0,0.05)
--shadow-sm: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)
--shadow-md: 0 4px 6px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)
--shadow-lg: 0 10px 15px rgba(0,0,0,0.10), 0 4px 6px rgba(0,0,0,0.05)
--shadow-xl: 0 20px 25px rgba(0,0,0,0.10), 0 10px 10px rgba(0,0,0,0.04)
```
**Shadow tokens — dark mode:** darker alphas. See CSS in section 15 for exact values.

**Overlay tokens:** `--overlay` rgba(10,11,13,0.35) for light. `--overlay` rgba(5,7,10,0.65) for dark.

**Rules:** Use size based shadows for elevation. Add a 1 px border in dark mode to restore edge definition.

---

## 8) Motion

**Durations:** `--duration-fast` 100 ms. `--duration-base` 200 ms. `--duration-slow` 300 to 400 ms.  
**Easing:** `--ease-in` cubic bezier(0.4, 0, 1, 1). `--ease-out` cubic bezier(0, 0, 0.2, 1). `--ease-in-out` cubic bezier(0.4, 0, 0.2, 1). `--ease-spring` cubic bezier(0.34, 1.56, 0.64, 1).

Respect `prefers-reduced-motion`. Important content never depends on motion.

---

## 9) Iconography

**Primary set:** Lucide. Open source. 1.5 to 2 px stroke. Rounded joins.

**Size tokens:** `--icon-xs` 16 px. `--icon-sm` 20 px. `--icon-md` 24 px. `--icon-lg` 32 px. `--icon-xl` 40 px.

**Rules:** Icons have accessible labels when meaningful. Decorative icons get `aria-hidden="true"`. Use semantic token colors. Do not use icon alone for critical actions.

---

## 10) Illustration and Graphics

Mood is minimal, geometric, clean. Limited palette. Thin strokes. Avoid skeuomorphism. Use SVG for web and PDF for print.

---

## 11) Interactive States

**Focus:** Visible ring through `--ring`. Focus is not hover. Provide skip links.  
**Hover:** Links change to `--link-hover`. Buttons darken or reduce opacity. Cards elevate.  
**Active:** Pressed items scale to 98 percent or use an inset shadow.  
**Disabled:** Obvious reduced opacity and blocked pointer events. Provide tooltips that explain why.

**Selection:** `::selection` uses `--selection-bg` and `--selection-text` from tokens.

---

## 12) Components

**Buttons:** Primary, secondary, quiet, destructive. One primary per screen. Minimum hit area 44 by 44 px. Show loading state. Combine icon and text when space allows.

**Inputs:** Label above. Helper text under. States include default, focus, error, success, disabled. Error copy is specific. Example. Email must include @  

**Links:** Underlined by default for inline links. Use `--link` and `--link-hover`. External links open in a new tab with an indicator.

**Cards:** Border and soft shadow. Hover elevates from `--shadow-sm` to `--shadow-md`. Respect radius tokens.

**Navigation:** Top bar height 56 to 64 px. Sticky with backdrop blur allowed. Side nav width 240 to 280 px. Breadcrumbs with `/` or `›`. The last crumb is not clickable.

**Modals:** Trap focus. Close with ESC. Optional overlay click. Restore focus on close. Prevent body scroll. Use `--overlay` and `--shadow-xl`.

**Tooltips and popovers:** Tooltip is hover only with short text. Popover is interactive and dismisses on outside click. Do not put essential info in a tooltip only.

**Tables:** Sticky header. Alternate rows. Right align numbers. Provide a mobile strategy and a data table fallback for charts.

---

## 13) Data Visualization

**Palettes:** Sequential for continuous data. Categorical derived from brand accents. Limit to 6 to 8 categories. Diverging uses red to gray to blue.  
**Rules:** Label axes with units. Provide a legend or inline labels. Start Y axis at zero unless there is a clear reason. Provide a data table for accessibility. Use color with pattern when possible.  
**Libraries:** Recharts. D3. Chart.js

---

## 14) Design Tokens — JSON source of truth

Tokens are named design decisions that compile to platform outputs.

**Example JSON (Style Dictionary friendly):**
```json
{
  "color": {
    "primary": {"value": "#2563EB"},
    "accent": {"value": "#3B82F6"},
    "success": {"value": "#16A34A"},
    "warning": {"value": "#D97706"},
    "danger": {"value": "#DC2626"},
    "info": {"value": "#0284C7"},
    "bg": {"surface": {"value": "#FFFFFF"}, "elevated": {"value": "#F5F7FA"}, "elevated2": {"value": "#EDF1F5"}},
    "text": {"primary": {"value": "#0B0C10"}, "secondary": {"value": "#1F232B"}, "muted": {"value": "#5B6575"}},
    "border": {"value": "#CBD4DF"},
    "link": {"value": "{color.primary}"},
    "linkHover": {"value": "{color.accent}"},
    "ring": {"value": "rgba(37,99,235,0.45)"},
    "shadow": {"xs": {"value": "0 1px 2px rgba(0,0,0,0.05)"}, "sm": {"value": "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)"}, "md": {"value": "0 4px 6px rgba(0,0,0,0.10)"}, "lg": {"value": "0 10px 15px rgba(0,0,0,0.10)"}, "xl": {"value": "0 20px 25px rgba(0,0,0,0.10)"}},
    "overlay": {"value": "rgba(10,11,13,0.35)"},
    "gradient": {"start": {"value": "{color.primary}"}, "end": {"value": "{color.accent}"}},
    "selection": {"bg": {"value": "rgba(37,99,235,0.18)"}, "text": {"value": "{color.text.primary}"}}
  },
  "space": {"0": {"value": "0"}, "1": {"value": "4px"}, "2": {"value": "8px"}, "3": {"value": "12px"}, "4": {"value": "16px"}, "5": {"value": "20px"}, "6": {"value": "24px"}, "8": {"value": "32px"}, "10": {"value": "40px"}, "12": {"value": "48px"}, "16": {"value": "64px"}, "20": {"value": "80px"}},
  "radius": {"xs": {"value": "4px"}, "sm": {"value": "6px"}, "md": {"value": "8px"}, "lg": {"value": "12px"}, "xl": {"value": "16px"}, "2xl": {"value": "24px"}, "full": {"value": "9999px"}},
  "fontSize": {"xs": {"value": "12px"}, "sm": {"value": "14px"}, "base": {"value": "16px"}, "lg": {"value": "18px"}, "xl": {"value": "20px"}, "2xl": {"value": "24px"}, "3xl": {"value": "30px"}, "4xl": {"value": "36px"}, "5xl": {"value": "48px"}, "6xl": {"value": "60px"}, "7xl": {"value": "72px"}}
}
```

**Hard rule:** No hex values in components. Components use tokens only.

---

## 15) CSS variables output

**Light theme**
```css
:root{
  --bg-surface:#FFFFFF; --bg-elevated:#F5F7FA; --bg-elevated-2:#EDF1F5;
  --text-primary:#0B0C10; --text-secondary:#1F232B; --text-muted:#5B6575;
  --border:#CBD4DF;
  --color-primary:#2563EB; --color-accent:#3B82F6; --color-success:#16A34A; --color-warning:#D97706; --color-danger:#DC2626; --color-info:#0284C7;
  --link:var(--color-primary); --link-hover:var(--color-accent); --ring:rgba(37,99,235,0.45);
  --shadow-xs:0 1px 2px rgba(0,0,0,0.05); --shadow-sm:0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08);
  --shadow-md:0 4px 6px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06);
  --shadow-lg:0 10px 15px rgba(0,0,0,0.10), 0 4px 6px rgba(0,0,0,0.05);
  --shadow-xl:0 20px 25px rgba(0,0,0,0.10), 0 10px 10px rgba(0,0,0,0.04);
  --overlay:rgba(10,11,13,0.35);
  --selection-bg:rgba(37,99,235,0.18); --selection-text:var(--text-primary);
  --gradient-start:var(--color-primary); --gradient-end:var(--color-accent);
  --radius-xs:4px; --radius-sm:6px; --radius-md:8px; --radius-lg:12px; --radius-xl:16px; --radius-2xl:24px; --radius-full:9999px;
  --text-xs:12px; --text-sm:14px; --text-base:16px; --text-lg:18px; --text-xl:20px; --text-2xl:24px; --text-3xl:30px; --text-4xl:36px; --text-5xl:48px; --text-6xl:60px; --text-7xl:72px;
  --icon-xs:16px; --icon-sm:20px; --icon-md:24px; --icon-lg:32px; --icon-xl:40px;
  --duration-fast:100ms; --duration-base:200ms; --duration-slow:300ms;
  --ease-in:cubic-bezier(0.4,0,1,1); --ease-out:cubic-bezier(0,0,0.2,1); --ease-in-out:cubic-bezier(0.4,0,0.2,1); --ease-spring:cubic-bezier(0.34,1.56,0.64,1);
}
```

**Dark theme**
```css
[data-theme="dark"]{
  --bg-surface:#0A0B0D; --bg-elevated:#141821; --bg-elevated-2:#1C2230;
  --text-primary:#F5F7FA; --text-secondary:#D9E1ED; --text-muted:#9AA5B5;
  --border:#2C3442;
  --color-primary:#3B82F6; --color-accent:#60A5FA; --color-success:#22C55E; --color-warning:#F59E0B; --color-danger:#EF4444; --color-info:#38BDF8;
  --link:var(--color-accent); --link-hover:var(--color-primary); --ring:rgba(96,165,250,0.55);
  --shadow-xs:0 1px 2px rgba(0,0,0,0.50); --shadow-sm:0 1px 3px rgba(0,0,0,0.50), 0 1px 2px rgba(0,0,0,0.40);
  --shadow-md:0 4px 6px rgba(0,0,0,0.50), 0 2px 4px rgba(0,0,0,0.40);
  --shadow-lg:0 10px 15px rgba(0,0,0,0.60), 0 4px 6px rgba(0,0,0,0.50);
  --shadow-xl:0 20px 25px rgba(0,0,0,0.70), 0 10px 10px rgba(0,0,0,0.60);
  --overlay:rgba(5,7,10,0.65);
  --selection-bg:rgba(96,165,250,0.25); --selection-text:var(--text-primary);
}
```

**High contrast theme**
```css
[data-theme="high-contrast"]{
  --bg-surface:#FFFFFF; --bg-elevated:#FFFFFF; --bg-elevated-2:#F0F0F0;
  --text-primary:#000000; --text-secondary:#000000; --text-muted:#333333;
  --border:#000000;
  --color-primary:#0000EE; --color-danger:#CC0000; --link:#0000EE; --link-hover:#0000EE; --ring:rgba(0,0,238,0.5);
}
```

---

## 16) Tailwind integration

Starter configuration that maps CSS variables to utilities and supports attribute based dark mode.

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        border: "var(--border)",
      },
      borderRadius: {
        sm: "var(--radius-sm)", md: "var(--radius-md)", lg: "var(--radius-lg)", xl: "var(--radius-xl)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)", sm: "var(--shadow-sm)", md: "var(--shadow-md)", lg: "var(--shadow-lg)", xl: "var(--shadow-xl)",
      },
      spacing: {
        1: "var(--space-1)", 2: "var(--space-2)", 3: "var(--space-3)", 4: "var(--space-4)", 5: "var(--space-5)", 6: "var(--space-6)",
      }
    }
  },
  plugins: []
}
```

---

## 17) Code and Documentation Style

Default language is TypeScript with strict mode. Use ESLint and Prettier. Unit tests for utilities. Integration tests for critical flows. Accessibility checks with jest axe.

**Conventional commits** keep history readable. Example. `feat(vibe-fixer): add crash replay runner`  
**README structure:** what, why, how to run, key concepts, examples, API, contributing, license.

---

## 18) Asset Management

**Folders:**
```
/design-system
  /brand
    /jcs
    /lantern
    /vibe-fixer
  /tokens
    tokens.json
    light.css
    dark.css
    high-contrast.css
  /components
  /icons
  /docs
```

Use SVG for web assets. Keep a Lucide subset as a sprite sheet when possible.

**Versioning:** `vMAJOR.MINOR.PATCH`. Major removes or renames tokens. Minor adds tokens or components. Patch fixes values.

---

## 19) Per product brand layer template

Required fields. Name. Purpose. Audience. Color accents one to two. Logo rules. Illustration mood. Three examples. Three donts.

Include a sample hero and layout snippet per brand. Keep accent use under control. Use the universal neutrals and components.

---

## 20) Do and Dont quick reference

**Color — Do.** Use neutrals for 80 percent. Test contrast. Limit accents. Use semantic tokens.  
**Color — Dont.** Do not hard code hex. Do not add new colors casually. Do not encode meaning with color alone.

**Type — Do.** Use Inter. Keep line length under 80 characters. Use semantic headings. Body at least 16 px.  
**Type — Dont.** Do not use ultra light weights. Do not mix many fonts. Do not use all caps for long text.

**Layout — Do.** Use 4 pt increments. Prefer 8 pt for big steps. Keep consistent padding. Respect breakpoints.  
**Layout — Dont.** Do not cram mobile layouts. Do not let text stretch beyond 80 characters. Do not mix random radii.

**Components — Do.** Reuse primitives. Use semantic HTML. Hit area 44 by 44 px. Show loading and error states.  
**Components — Dont.** Do not hide disabled actions. Do not bury the primary action. Do not build one offs without review.

**Interaction — Do.** Always show focus. Keep hover distinct from focus. Respect reduced motion. Confirm destructive actions.  
**Interaction — Dont.** Do not remove the outline without replacement. Do not over animate. Do not place essential info in hover only tooltips.

**Accessibility — Do.** Test with keyboard only. Run automated checks. Provide alt text. Use ARIA only when needed.  
**Accessibility — Dont.** Do not rely on color alone. Do not skip heading levels. Do not allow low contrast. Do not assume mouse use.

---

## 21) Starter artifacts

- Figma library with variables and component variants  
- `tokens.json` in the repo as the source of truth  
- Generated CSS files per theme  
- Tailwind config that maps to tokens  
- Lucide subset and React components  
- Sample pages. Landing. Documentation. Dashboard. Email

---

## 22) Roadmap and Changelog

**v0.1** Initial. Core tokens. Basic components. Light and dark themes. React mockup.

**v0.2** Added radius tokens, shadow tokens, motion guidelines, Lucide icon system, high contrast theme, data viz section, expanded states, navigation patterns, and form practices. Clarified spacing and font loading. Fixed dark mode shadow contrast and link state docs.

**v0.3** This spec. Theme attribute contract. Motion variables. Icon size tokens. No hex in components rule. Tailwind mapping section. Type scale validation guidance. Expanded component rules and accessibility checks.

---

## 23) Getting started checklist

**New projects:** Install fonts. Import token CSS. Add `data-theme` on `<html>`. Implement a theme switcher. Use tokens only. Test in light, dark, and high contrast. Run accessibility audit. Add a focus ring utility.  
**Existing projects:** Map existing colors to tokens. Replace hard coded spacing. Refactor buttons to match variants. Add focus states. Test keyboard navigation. Update documentation. Deploy a preview.

---

## 24) Support and resources

Documentation lives in this guide and the tokens repo. Link a living mockup once deployed. Figma is the source of truth for design assets.  
Tools. WebAIM contrast checker. WAVE. Coblis simulator. Tailwind docs.  
Community. Create a dedicated channel. Hold weekly office hours. Keep a shared backlog for system issues.

---

**This is a living document. Next review on Feb 1, 2026.**

