# Chronica Board Examples

This folder contains example JSON files demonstrating the **AI-optimized Chronica board format**. Use these as references when creating your own boards or when asking an AI to generate boards for you.

---

## Quick Start

1. **Read the main guide:** [`../AI-BOARD-GENERATION-GUIDE.md`](../AI-BOARD-GENERATION-GUIDE.md)
2. **Pick an example** from the list below
3. **Import into Chronica:**
   - Open Chronica
   - Click hamburger menu (☰) → "Import"
   - Click "Paste JSON" tab
   - Copy-paste the example JSON
   - Click "Preview" then "Import"

---

## Example Files

### 1. **`template-full.json`** - Complete Reference Template

**Use this when:** You need to see ALL possible fields and options

**What's inside:**
- Every possible field (required + optional)
- All 7 custom field types demonstrated
- Multiple column types with different colors
- Cards with all possible properties (description, tags, links, due dates, custom fields)
- Inline descriptions explaining each field
- 4 columns, 8 cards

**Best for:**
- Learning the complete schema
- Copy-paste starting point for complex boards
- Reference when you forget field names

---

### 2. **`minimal-valid.json`** - Simplest Valid Board

**Use this when:** You want to create the absolute minimum board

**What's inside:**
- Only required fields (no optional fields)
- 2 columns: "To Do" and "Done"
- 3 cards with only IDs and titles
- No custom fields, no colors, no tags

**Best for:**
- Understanding what's truly required
- Quick board creation
- Testing import functionality

---

### 3. **`with-custom-fields.json`** - Custom Fields Demo

**Use this when:** You want to see how custom fields work

**What's inside:**
- 3 custom field definitions (priority, estimate, assignee)
- Select field with 4 options
- Number field with min/max validation
- Text field with max length
- 6 cards using custom fields
- Sprint planning theme

**Best for:**
- Learning custom field definitions
- Understanding field validation
- Sprint/project planning templates

---

### 4. **`multi-column-nested.json`** - Complex Roadmap Board

**Use this when:** You need a real-world example at scale

**What's inside:**
- 6 columns (Discovery → Planning → Design → Development → Testing → Shipped)
- 20 cards distributed across columns
- Custom fields (status, owner)
- Tags categorizing initiatives
- Column colors matching workflow stages
- Q4 product roadmap theme

**Best for:**
- Roadmap planning
- Feature tracking
- Understanding nested structure at scale

---

### 5. **`empty-board.json`** - Empty Board Template

**Use this when:** You want to set up structure before adding cards

**What's inside:**
- 3 standard columns (To Do, In Progress, Done)
- 0 cards (empty `cards` arrays)
- Valid statistics with 0 counts
- Clean starting point

**Best for:**
- Setting up new projects
- Template boards
- Testing edge cases

---

### 6. **`all-field-types.json`** - Field Types Reference

**Use this when:** You need examples of all 6 field types

**What's inside:**
- 6 custom field definitions (one of each type)
- Text field with maxLength validation
- Number field with min/max validation
- Date field (ISO8601 format)
- Select field with 4 options
- URL field (HTTP/HTTPS validation)
- Checkbox field (boolean)
- 6 cards, each demonstrating one field type

**Best for:**
- Learning field type syntax
- Understanding validation rules
- Copy-paste field definitions

---

## Import Instructions

### Method 1: Import from File

1. Download the JSON file
2. Open Chronica
3. Click hamburger menu (☰) → "Import"
4. Click "From File" tab
5. Click "Choose File" and select the downloaded JSON
6. Board appears in sidebar

### Method 2: Paste JSON

1. Open the JSON file in a text editor
2. Copy entire contents (Ctrl+A, Ctrl+C)
3. Open Chronica
4. Click hamburger menu (☰) → "Import"
5. Click "Paste JSON" tab
6. Paste JSON (Ctrl+V)
7. Click "Preview" to verify structure
8. Click "Import" to add board

---

## Customization Guide

### Modify an Example

1. **Start with the closest example** to your use case
2. **Change board name:**
   - Update `meta.project`
   - Update `board.name`
3. **Modify columns:**
   - Change `column.title`
   - Update `column.key` (lowercase, no spaces)
   - Adjust `column.order` (0, 1, 2, ...)
   - Add/remove columns (update `board.column_count`)
4. **Edit cards:**
   - Change `card.title` and `card.description`
   - Update `card.column` to match column `key`
   - Add/remove cards (update `column.card_count` and `board.card_count`)
5. **Update statistics:**
   - Recalculate `statistics.total_cards`
   - Update `statistics.cards_per_column` counts
   - Recalculate `statistics.tags_used` and `statistics.colors_used`

### Add Custom Fields

1. **Define in `meta.fields`:**
   ```json
   "meta": {
     "fields": {
       "your_field_id": {
         "id": "your_field_id",
         "label": "Your Field Name",
         "type": "select",
         "required": false,
         "validation": {
           "options": ["Option 1", "Option 2"]
         }
       }
     }
   }
   ```

2. **Use in cards:**
   ```json
   "card": {
     "title": "Your card",
     "customFields": {
       "your_field_id": "Option 1"
     }
   }
   ```

---

## Validation Checklist

Before importing, verify:

- [ ] Valid JSON syntax (no trailing commas, matching brackets)
- [ ] `meta.schema` is `"chronica-ai-optimized"`
- [ ] `meta.version` is `2`
- [ ] All column `key` values are unique
- [ ] All card `id` values are unique
- [ ] All card `column` values match a column `key`
- [ ] `board.column_count` matches number of columns
- [ ] `board.card_count` matches total cards
- [ ] `column.card_count` matches cards in that column
- [ ] `statistics` counts match actual data
- [ ] Custom field IDs in cards match definitions in `meta.fields`

---

## Common Use Cases

| Use Case | Recommended Example | Customize By |
|----------|---------------------|--------------|
| Software sprint | `with-custom-fields.json` | Change card titles, add/remove tasks |
| Product roadmap | `multi-column-nested.json` | Adjust columns to your workflow stages |
| Bug tracker | `with-custom-fields.json` | Change priority options, add "severity" field |
| Personal GTD | `minimal-valid.json` | Add contexts as tags, use 3 columns |
| Team capacity planning | `with-custom-fields.json` | Change "estimate" to hours, add "assignee" |
| Feature requests | `empty-board.json` | Start empty, let AI populate from user feedback |

---

## File Size Reference

| File | Size | Columns | Cards | Custom Fields |
|------|------|---------|-------|---------------|
| `template-full.json` | ~8 KB | 4 | 8 | 7 |
| `minimal-valid.json` | ~1 KB | 2 | 3 | 0 |
| `with-custom-fields.json` | ~3 KB | 3 | 6 | 3 |
| `multi-column-nested.json` | ~6 KB | 6 | 20 | 2 |
| `empty-board.json` | ~1 KB | 3 | 0 | 0 |
| `all-field-types.json` | ~4 KB | 2 | 6 | 6 |

---

## Tips for AI Generation

When asking an AI (Claude, ChatGPT, etc.) to generate a board:

1. **Specify the schema:**
   - "Use Chronica AI-optimized format (schema: chronica-ai-optimized, version: 2)"

2. **Provide structure:**
   - "Create 4 columns: Backlog, To Do, In Progress, Done"
   - "Generate 15 cards distributed across columns"

3. **Define custom fields:**
   - "Add custom field 'priority' (select: High/Medium/Low)"
   - "Add custom field 'estimate' (number, 0-40 hours)"

4. **Include an example:**
   - "Use this example as a template: [paste minimal-valid.json]"

5. **Verify structure:**
   - "Ensure all required fields are present"
   - "Validate that statistics counts match actual data"

---

## Next Steps

1. **Import an example** to see how Chronica displays it
2. **Read the main guide** for detailed field explanations
3. **Modify an example** to fit your project
4. **Ask an AI** to generate a custom board using the template

---

## Resources

- **Main Guide:** [`../AI-BOARD-GENERATION-GUIDE.md`](../AI-BOARD-GENERATION-GUIDE.md)
- **Type Definitions:** `../../src/state/types.ts` (TypeScript source)
- **Schema Validation:** `../../src/io/schema.ts` (Zod schemas)
- **Import Logic:** `../../src/io/importExport.ts` (Implementation)

---

**Last Updated:** 2025-11-04
**Examples Version:** 1.0
**Compatible with:** Chronica v0.1.0-alpha.7+
