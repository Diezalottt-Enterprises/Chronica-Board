# Column Management Testing Checklist

## Setup

1. Build and run app: `pnpm build && pnpm tauri dev`
2. Create board with multiple columns and cards

## Test Cases

### Column Overflow Menu (3-dot icon in column header)

- [ ] Click 3-dot icon → menu appears
- [ ] Click outside menu → menu closes
- [ ] ESC key → menu closes

### Rename Column

- [ ] Overflow menu → "Rename" → enter new name → saves correctly
- [ ] Empty name → validation prevents or uses default
- [ ] Column header updates immediately

### Add Column

- [ ] Click "Add Column" button → new column appears at end
- [ ] New column is empty (no starter cards)
- [ ] New column has default title (e.g., "New Column")

### Delete Column

- [ ] Column with NO cards → deletes immediately
- [ ] Column with cards → shows migration prompt
- [ ] Migrate cards to another column → cards move correctly
- [ ] Delete without migration → cards are lost (confirm prompt)
- [ ] Last column cannot be deleted (check behavior)

### Duplicate Column

- [ ] Overflow menu → "Duplicate" → new column appears
- [ ] All cards copied to new column (not moved)
- [ ] Original column unchanged
- [ ] New column title has " (Copy)" suffix

### Sort Cards

- [ ] Overflow menu → "Sort A-Z" → cards sort alphabetically ascending
- [ ] Overflow menu → "Sort Z-A" → cards sort alphabetically descending
- [ ] Case-insensitive sorting works correctly

### Collapse/Expand Column

- [ ] Overflow menu → "Collapse" → column shrinks to thin vertical bar
- [ ] Collapsed column shows title vertically
- [ ] Click collapsed column → expands back to full width
- [ ] Cards remain in collapsed column (not lost)

### Column Reordering (Drag & Drop)

- [ ] Drag column header → column moves between positions
- [ ] Drop between columns → order updates
- [ ] Drag handle visible when unlocked

### Lock/Unlock Column Reordering

- [ ] Toolbar → Lock icon → column dragging disabled
- [ ] Locked state → no drag handles visible
- [ ] Toolbar → Unlock icon → column dragging re-enabled
- [ ] Lock state persists across app restarts

### Column Color

- [ ] Overflow menu → "Set Color" → color picker appears
- [ ] Select color → column header background updates
- [ ] Color persists across app restarts
- [ ] Reset to default color works

## Edge Cases

- [ ] Multiple collapsed columns display correctly side-by-side
- [ ] Drag card into collapsed column → column auto-expands
- [ ] Responsive behavior with narrow window → columns scale down
- [ ] Overflow menu doesn't clip off screen edges

## Data Persistence

- [ ] Close and reopen app → all column changes persisted
- [ ] Export board → includes column colors, collapsed state
- [ ] Import board → restores column states correctly

## Notes

- All tests should be performed on the uncommitted column management work
- Report any bugs or unexpected behavior before committing
- Verify no console errors during testing
