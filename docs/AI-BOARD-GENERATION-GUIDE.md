# AI Board Generation Guide for Chronica

**Version:** 1.0
**Last Updated:** 2025-11-04
**App Version:** v0.1.0-alpha.7+

---

## Overview

Chronica supports **AI-generated board creation** through a specialized JSON format. This guide explains how to create valid board JSON files that can be imported directly into Chronica, either manually or by having an AI (like Claude, ChatGPT, or similar) generate them for you.

**Use Cases:**
- Generate complete project boards from descriptions
- Create sprint planning boards with pre-populated tasks
- Build roadmaps with AI-suggested initiatives
- Auto-generate bug tracking boards from repository issues
- Enrich existing boards with AI-added details

---

## JSON Format: AI-Optimized vs Standard

Chronica supports **two import formats**:

### 1. **AI-Optimized Format** (RECOMMENDED for AI generation)

**Schema:** `chronica-ai-optimized` v2

**Advantages:**
- ✅ Nested structure (columns contain cards)
- ✅ Easier for AI to construct
- ✅ Includes statistics for verification
- ✅ Supports timestamps and metadata
- ✅ Redundant counts help prevent errors

**When to use:** AI generation, complex boards, multi-board exports

### 2. **Standard Format**

**Schema:** `chronica-board` v1

**Advantages:**
- ✅ Flat structure (columns and cards separate)
- ✅ Simpler for manual editing
- ✅ Smaller file size
- ✅ Better for version control (smaller diffs)

**When to use:** Manual JSON editing, simple boards, legacy compatibility

---

## This Guide Focuses On: AI-Optimized Format

The rest of this guide explains the **AI-optimized format** (`chronica-ai-optimized`), which is the recommended format for AI-generated boards.

---

## Structure Overview

An AI-optimized Chronica board JSON file has **three main sections**:

```json
{
  "meta": { /* Board metadata, schema version, custom field definitions */ },
  "board": { /* Board name, columns (with nested cards), timestamps */ },
  "statistics": { /* Counts, tags used, colors used - for verification */ }
}
```

---

## Section 1: `meta` (Metadata)

The `meta` section contains **schema information, timestamps, and custom field definitions**.

### Required Fields

```json
{
  "meta": {
    "schema": "chronica-ai-optimized",        // REQUIRED: Must be exactly this
    "version": 2,                              // REQUIRED: Must be 2
    "ai_optimized": true,                      // REQUIRED: Must be true
    "project": "My Board Name",                // REQUIRED: Board name (also in board.name)
    "created_at": "2025-11-04T10:30:00.000Z",  // REQUIRED: ISO8601 timestamp
    "modified_at": "2025-11-04T10:30:00.000Z", // REQUIRED: ISO8601 timestamp
    "generated_by": "Chronica",                // REQUIRED: Generator name
    "app_version": "0.1.0-alpha.7"             // REQUIRED: Chronica version
  }
}
```

### Optional Fields

```json
{
  "meta": {
    // ... required fields ...
    "description": "Optional board description for AI context",  // OPTIONAL
    "fields": {                                                   // OPTIONAL: Custom field definitions
      "priority": {
        "id": "priority",
        "label": "Priority",
        "type": "select",
        "required": false,
        "validation": {
          "options": ["High", "Medium", "Low"]
        }
      }
    }
  }
}
```

### Custom Field Definitions

If your cards use **custom fields**, define them in `meta.fields`. Each field needs:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ | Unique field identifier (use as key in `customFields`) |
| `label` | string | ✅ | Display name (max 50 chars) |
| `type` | string | ✅ | `text`, `number`, `date`, `select`, `url`, or `checkbox` |
| `required` | boolean | ❌ | Whether field is mandatory (default: false) |
| `validation` | object | ❌ | Type-specific validation rules |

**Validation rules by field type:**

```json
{
  "text_field": {
    "type": "text",
    "validation": {
      "maxLength": 500,           // Max characters (1-1000)
      "pattern": "^[A-Z]{2}-\\d+$" // Regex pattern (optional)
    }
  },
  "number_field": {
    "type": "number",
    "validation": {
      "min": 0,                   // Minimum value
      "max": 100                  // Maximum value
    }
  },
  "select_field": {
    "type": "select",
    "validation": {
      "options": ["Option A", "Option B"] // Up to 100 options
    }
  }
}
```

**Limits:**
- Max 20 custom fields per board
- Max 50 characters for field labels
- Max 1000 characters for text field values
- Max 100 options for select fields

---

## Section 2: `board` (Board Content)

The `board` section contains the **board name, columns, and nested cards**.

### Board Structure

```json
{
  "board": {
    "id": "550e8400-e29b-41d4-a716-446655440000", // REQUIRED: UUID v4
    "name": "My Sprint Board",                    // REQUIRED: Board name
    "created_at": "2025-11-04T10:30:00.000Z",     // OPTIONAL: ISO8601 timestamp
    "modified_at": "2025-11-04T10:30:00.000Z",    // OPTIONAL: ISO8601 timestamp
    "column_count": 3,                             // REQUIRED: Number of columns
    "card_count": 10,                              // REQUIRED: Total cards across all columns
    "columns": [ /* ... */ ]                       // REQUIRED: Array of columns with nested cards
  }
}
```

### Column Structure

Each column in `board.columns` contains:

```json
{
  "key": "todo",                // REQUIRED: Unique column ID (no spaces, use kebab-case)
  "title": "To Do",             // REQUIRED: Display title
  "order": 0,                   // REQUIRED: Display order (0-indexed, no gaps)
  "color": "#3b82f6",           // OPTIONAL: Hex color (e.g., "#3b82f6") or null
  "collapsed": false,           // OPTIONAL: Whether column is collapsed (default: false)
  "card_count": 5,              // REQUIRED: Number of cards in this column
  "cards": [ /* ... */ ]        // REQUIRED: Array of cards in this column
}
```

**Column Key Rules:**
- Use lowercase with hyphens (e.g., `"todo"`, `"in-progress"`, `"code-review"`)
- No spaces, no special characters except hyphens
- Common keys: `todo`, `doing`, `done`, `backlog`, `in-progress`, `review`, `testing`

**Column Color:**
- Hex format: `"#3b82f6"` (6-digit hex with `#`)
- Or `null` for default color
- Predefined colors: Mint `#98D8C8`, Cyan `#6FC2DB`, Salmon `#F88379`, Lavender `#B4A7D6`, Slate `#8D99AE`

### Card Structure

Each card in `column.cards` contains:

```json
{
  "id": "card-123",                           // REQUIRED: Unique card ID (UUID recommended)
  "title": "Implement login page",            // REQUIRED: Card title
  "description": "Create login UI with...",   // OPTIONAL: Markdown description
  "color": "mint",                            // OPTIONAL: Color name or hex (see below)
  "tags": ["frontend", "authentication"],     // OPTIONAL: Array of tag strings
  "rank": 1000,                               // OPTIONAL: Sort order (default: 1000, increment by 100)
  "due": "2025-11-10",                        // OPTIONAL: Due date (ISO8601 or null)
  "links": [                                  // OPTIONAL: Array of external links
    {
      "label": "Design mockup",
      "url": "https://figma.com/..."
    }
  ],
  "customFields": {                           // OPTIONAL: Custom field values (keys match meta.fields)
    "priority": "High",
    "estimate": 8
  },
  "created_at": "2025-11-04T10:30:00.000Z",  // OPTIONAL: ISO8601 timestamp
  "modified_at": "2025-11-04T10:30:00.000Z"  // OPTIONAL: ISO8601 timestamp
}
```

**Card Field Details:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | UUID v4 recommended, must be unique across board |
| `title` | string | ✅ | Max 500 chars, sanitized on import |
| `description` | string | ❌ | Supports Markdown, max 5000 chars |
| `color` | string | ❌ | `"mint"`, `"cyan"`, `"salmon"`, `"lavender"`, `"slate"`, or hex `"#RRGGBB"` |
| `tags` | array | ❌ | Array of strings, max 50 tags, each max 50 chars |
| `rank` | number | ❌ | Sort order within column (default: 1000, increment by 100+) |
| `due` | string | ❌ | ISO8601 date `"YYYY-MM-DD"` or `null` |
| `links` | array | ❌ | Max 20 links, each with `label` and `url` |
| `customFields` | object | ❌ | Keys must match field IDs in `meta.fields` |

**Card Rank (Sort Order):**
- Cards are sorted by `rank` within each column
- Default: `1000`
- Increment by `100` or more: `1000`, `1100`, `1200`, etc.
- Lower rank = appears first in column
- If two cards have same rank, order is undefined

**Custom Fields:**
- Keys in `customFields` **must match** field IDs defined in `meta.fields`
- Values must match field type:
  - `text`: string (max length from validation)
  - `number`: number (within min/max from validation)
  - `date`: ISO8601 string `"YYYY-MM-DD"`
  - `select`: string (must be one of validation options)
  - `url`: string (must be valid HTTP/HTTPS URL)
  - `checkbox`: boolean (`true` or `false`)

---

## Section 3: `statistics` (Verification)

The `statistics` section provides **counts and metadata for AI verification**.

```json
{
  "statistics": {
    "total_columns": 3,                        // REQUIRED: Must match board.column_count
    "total_cards": 10,                         // REQUIRED: Must match board.card_count
    "cards_per_column": {                      // REQUIRED: Column title → card count
      "To Do": 5,
      "In Progress": 3,
      "Done": 2
    },
    "tags_used": ["frontend", "backend"],      // REQUIRED: All unique tags across all cards
    "colors_used": ["mint", "cyan", "#3b82f6"] // REQUIRED: All unique colors across all cards/columns
  }
}
```

**Validation:**
- `total_columns` must equal `board.columns.length`
- `total_cards` must equal sum of all `column.card_count`
- `cards_per_column` keys must match column titles
- `tags_used` must include all tags from all cards (deduplicated)
- `colors_used` must include all colors from cards and columns (deduplicated)

---

## Required vs Optional Fields Summary

### Absolutely Required (Board won't import without these)

```
✅ meta.schema = "chronica-ai-optimized"
✅ meta.version = 2
✅ meta.ai_optimized = true
✅ meta.project (board name)
✅ meta.created_at (ISO8601 timestamp)
✅ meta.modified_at (ISO8601 timestamp)
✅ meta.generated_by
✅ meta.app_version

✅ board.id (UUID)
✅ board.name
✅ board.column_count
✅ board.card_count
✅ board.columns (array, at least 1 column)

✅ column.key
✅ column.title
✅ column.order
✅ column.card_count
✅ column.cards (array, can be empty)

✅ card.id
✅ card.title

✅ statistics.total_columns
✅ statistics.total_cards
✅ statistics.cards_per_column
✅ statistics.tags_used
✅ statistics.colors_used
```

### Optional (Can be omitted or null)

```
❌ meta.description
❌ meta.fields (but needed if cards use customFields)

❌ board.created_at
❌ board.modified_at
❌ board.description

❌ column.color
❌ column.collapsed

❌ card.description
❌ card.color
❌ card.tags
❌ card.rank
❌ card.due
❌ card.links
❌ card.customFields
❌ card.created_at
❌ card.modified_at
```

---

## Bracket Nesting Rules

Correct nesting is critical. Here's the hierarchy:

```json
{                                    // Root object
  "meta": {                          // Meta object
    "fields": {                      // Fields object (if using custom fields)
      "field-id": {                  // Individual field definition
        "validation": { ... }        // Validation object (optional)
      }
    }
  },
  "board": {                         // Board object
    "columns": [                     // Columns array
      {                              // Column object
        "cards": [                   // Cards array
          {                          // Card object
            "tags": [ ... ],         // Tags array (strings)
            "links": [ ... ],        // Links array
            "customFields": { ... }  // Custom fields object
          }
        ]
      }
    ]
  },
  "statistics": {                    // Statistics object
    "cards_per_column": { ... },     // Cards per column object
    "tags_used": [ ... ],            // Tags used array
    "colors_used": [ ... ]           // Colors used array
  }
}
```

**Key Points:**
- `columns` is an **array** `[...]` containing column **objects** `{...}`
- `cards` is an **array** `[...]` inside each column, containing card **objects** `{...}`
- `tags`, `tags_used`, `colors_used` are **arrays** of strings
- `links` is an **array** of link **objects**
- `fields`, `customFields`, `cards_per_column` are **objects** `{...}` with key-value pairs

---

## Custom Field Placement

Custom fields require **three steps**:

### Step 1: Define in `meta.fields`

```json
{
  "meta": {
    "fields": {
      "priority": {                  // Field ID (use this in cards)
        "id": "priority",
        "label": "Priority",
        "type": "select",
        "required": false,
        "validation": {
          "options": ["High", "Medium", "Low"]
        }
      },
      "estimate": {
        "id": "estimate",
        "label": "Time Estimate (hours)",
        "type": "number",
        "required": false,
        "validation": {
          "min": 0,
          "max": 100
        }
      }
    }
  }
}
```

### Step 2: Use in `card.customFields`

```json
{
  "card": {
    "title": "Implement feature X",
    "customFields": {
      "priority": "High",     // Matches field ID, value is one of validation.options
      "estimate": 8            // Matches field ID, value is number within min/max
    }
  }
}
```

### Step 3: Include in Field Counts

```json
{
  "meta": {
    "fields": {
      "priority": { /* ... */ },
      "estimate": { /* ... */ }
    }
  }
}
```

**Rules:**
- Field IDs in `meta.fields` keys must match keys in `card.customFields`
- Field values must match field type and validation rules
- If a field is `required: true`, **all cards** must have that field
- If a field is `required: false`, cards can omit it

---

## Import Workflow

Once you have a valid JSON file:

### Option 1: Import from File

1. Open Chronica
2. Click hamburger menu (☰) → "Import"
3. Click "From File" tab
4. Click "Choose File"
5. Select your JSON file
6. Board appears in sidebar

### Option 2: Paste JSON

1. Open Chronica
2. Click hamburger menu (☰) → "Import"
3. Click "Paste JSON" tab
4. Paste your JSON into the textarea
5. Click "Preview" to verify structure
6. Click "Import" to add board

**Multi-Board Import:**
If your JSON has `meta.boards` (array) instead of `meta.board` (object), Chronica will import all boards at once.

---

## Troubleshooting

### Common Errors

#### "Invalid JSON"
- **Cause:** Syntax error (missing comma, bracket, quote)
- **Fix:** Use a JSON validator (jsonlint.com) to find syntax errors

#### "Schema validation failed"
- **Cause:** Missing required field or wrong data type
- **Fix:** Check that all required fields from the summary are present

#### "Field validation failed"
- **Cause:** Custom field value doesn't match validation rules
- **Fix:** Check that select values match options, numbers are within min/max, etc.

#### "Column key collision"
- **Cause:** Two columns have the same `key`
- **Fix:** Ensure all column keys are unique

#### "Card not found in column"
- **Cause:** Card's `column` field doesn't match any column `key`
- **Fix:** Verify every card's `column` value matches a column `key`

#### "Count mismatch"
- **Cause:** `statistics` counts don't match actual data
- **Fix:** Recalculate counts:
  - `total_columns` = number of objects in `board.columns`
  - `total_cards` = sum of all `column.card_count`
  - `cards_per_column` = count cards in each column

### Validation Checklist

Before importing, verify:

- [ ] Valid JSON syntax (no trailing commas, matching brackets)
- [ ] `meta.schema` is `"chronica-ai-optimized"`
- [ ] `meta.version` is `2`
- [ ] All timestamps are ISO8601 format (`YYYY-MM-DDTHH:mm:ss.sssZ`)
- [ ] All column `key` values are unique
- [ ] All card `id` values are unique
- [ ] All card `column` values match a column `key`
- [ ] Custom field IDs in cards match definitions in `meta.fields`
- [ ] Select field values are in validation options
- [ ] Number fields are within min/max range
- [ ] `statistics` counts match actual data

---

## Tips for AI Generation

If you're asking an AI to generate a board:

### Good Prompts

✅ "Create a Chronica board JSON in AI-optimized format with 3 columns (Backlog, In Progress, Done) and 10 user stories for a task management app. Include priority custom field (High/Medium/Low)."

✅ "Generate a sprint planning board with 15 tasks. Use columns: To Do, Doing, Review, Done. Add time estimate custom field (number, 0-40 hours). Include tags: frontend, backend, design."

✅ "Build a roadmap board with 6 quarters as columns and 12 initiatives as cards. Add custom fields: status (select: planned/active/shipped), owner (text), revenue_impact (number)."

### Bad Prompts

❌ "Make me a board" (too vague)
❌ "Create a JSON file" (doesn't specify format)
❌ "Generate tasks" (no structure specified)

### Prompt Template

```
Create a Chronica board JSON file in AI-optimized format (schema: chronica-ai-optimized, version: 2).

Board details:
- Name: [BOARD_NAME]
- Columns: [COLUMN_1], [COLUMN_2], [COLUMN_3]
- Number of cards: [COUNT]
- Theme: [DESCRIPTION]

Custom fields:
- [FIELD_NAME]: [TYPE] with [VALIDATION]

Requirements:
- Cards should have meaningful titles and descriptions
- Distribute cards across columns
- Add relevant tags
- Include statistics section

Output valid JSON matching the Chronica AI-optimized schema.
```

---

## Next Steps

1. **Start with the template:** Use `docs/examples/template-full.json` as your starting point
2. **Study examples:** Check `docs/examples/` for real-world examples
3. **Test import:** Always test your JSON by importing it before sharing
4. **Iterate:** Start small (3 cards), then scale up once structure is correct

---

## Resources

- **Example Files:** `docs/examples/` folder
- **Full Template:** `docs/examples/template-full.json`
- **Minimal Example:** `docs/examples/minimal-valid.json`
- **Schema Definition:** `src/state/types.ts` (TypeScript types)
- **Validation Logic:** `src/io/schema.ts` (Zod schemas)
- **Import Code:** `src/io/importExport.ts`

---

**Questions or Issues?**
- File an issue: https://github.com/anthropics/chronica/issues
- Check validation errors in browser console (F12)

---

**Document Version:** 1.0
**Compatible with:** Chronica v0.1.0-alpha.7+
**Last Updated:** 2025-11-04
