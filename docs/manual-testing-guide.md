# Chronica v0.1.0-alpha - Manual Testing Guide

**Purpose:** Comprehensive step-by-step guide to manually test all features and verify Phase 0-3 implementation.

**Last Updated:** 2025-10-25

---

## Pre-Testing Setup

### Environment Preparation
- [ ] Close any running instances of Chronica
- [ ] Delete test data: `%AppData%\Chronica\` (backup first if needed)
- [ ] Open DevTools (F12) for console monitoring
- [ ] Have Task Manager open to monitor system tray

### Launch Application
```bash
pnpm tauri dev
```
- [ ] App launches without errors
- [ ] Console shows initialization logs
- [ ] Window appears at default position (1000x700)
- [ ] No TypeScript/Rust errors in terminal

---

## Phase 0: Security Features

### Test 1: XSS Prevention (Input Sanitization)
**Goal:** Verify malicious input is sanitized

**Step-by-step:**

1. **Test malicious script in card title:**
   - [ ] Click the **"+ Add Card"** button in the **"To Do"** column
   - [ ] In the **Title** field, paste: `<script>alert('XSS')</script>`
   - [ ] Click **"Create"** button
   - [ ] **Expected:** Card displays the text literally (with angle brackets visible as text)
   - [ ] **Fail if:** Alert popup appears, or text is hidden

2. **Test image injection:**
   - [ ] Click **"+ Add Card"** in **"Doing"** column
   - [ ] In **Title** field, paste: `<img src=x onerror="alert(1)">`
   - [ ] Click **"Create"**
   - [ ] **Expected:** Full text visible as plain text (not rendered as broken image)
   - [ ] **Fail if:** Alert appears or console shows errors

3. **Test iframe injection in description:**
   - [ ] Click **"+ Add Card"** in **"Done"** column
   - [ ] Title: "Security Test"
   - [ ] In **Description** field, paste: `<iframe src="evil.com"></iframe>`
   - [ ] Click **"Create"**
   - [ ] Click the card to open it for editing
   - [ ] **Expected:** Description shows the text literally, no embedded frame
   - [ ] **Fail if:** Iframe appears or network requests to evil.com in DevTools Network tab

4. **Test HTML in existing card:**
   - [ ] Click any existing card to edit it
   - [ ] Change title to: `<b>bold text</b> and <i>italic</i>`
   - [ ] Change description to: `<a href="javascript:alert(1)">click me</a>`
   - [ ] Click **"Save"**
   - [ ] **Expected:** All HTML tags displayed as plain text
   - [ ] **Fail if:** Text is bold/italic or link is clickable

5. **Test custom fields (if you created any in Settings):**
   - [ ] Go to Settings (gear icon) → Custom Fields tab
   - [ ] If no fields exist, create a text field: Name "Notes", Type "text"
   - [ ] Create a new card
   - [ ] In the "Notes" custom field, enter: `<b>bold</b>`
   - [ ] Click **"Create"**
   - [ ] **Expected:** `<b>bold</b>` appears as plain text
   - [ ] **Fail if:** Text appears bold

**Pass Criteria:** No alerts fire, all HTML renders as plain text, no console errors

---

### Test 2: File Size Validation (Import)
**Goal:** Verify import rejects oversized files

**Preparation - Create test files:**

1. **Create small valid file:**
   - [ ] Open Notepad or any text editor
   - [ ] Paste this JSON:
   ```json
   {
     "meta": {
       "schema": "chronica-board",
       "version": 1,
       "project": "Test Import",
       "generated_by": "manual",
       "created_at": "2025-01-25T00:00:00Z",
       "app_version": "v0.1.0-alpha"
     },
     "columns": [
       {"key": "todo", "title": "To Do", "order": 0},
       {"key": "doing", "title": "Doing", "order": 1},
       {"key": "done", "title": "Done", "order": 2}
     ],
     "cards": [
       {"id": "test-123", "title": "Test Card", "column": "todo", "rank": 1000}
     ]
   }
   ```
   - [ ] Save as `small-board.json` to your Desktop

2. **Create oversized file (>2MB):**
   - [ ] Copy the above JSON
   - [ ] In the cards array, add 5000+ cards (or make description field VERY long - 100,000+ characters)
   - [ ] Example: Add this card with huge description:
   ```json
   {"id": "huge-1", "title": "Huge", "column": "todo", "rank": 1000, "description": "A..."}
   ```
   - [ ] Where the `A...` is repeated 2,000,000 times to exceed 2MB
   - [ ] Save as `large-board.json` to your Desktop
   - [ ] Verify file size: Right-click → Properties → Should show >2MB (2,097,152 bytes)

**Test Import:**

3. **Import small valid file:**
   - [ ] In Chronica, look at left sidebar
   - [ ] Click **"Import"** button (folder icon, above Settings)
   - [ ] File picker opens
   - [ ] Navigate to Desktop, select `small-board.json`
   - [ ] Click **"Open"**
   - [ ] **Expected:** Success message, new board "Test Import" appears in sidebar
   - [ ] **Expected:** Board contains the test card
   - [ ] **Fail if:** Error message appears

4. **Import oversized file:**
   - [ ] Click **"Import"** button in sidebar again
   - [ ] Select `large-board.json` from Desktop
   - [ ] Click **"Open"**
   - [ ] **Expected:** Error dialog: "File too large (max 2MB)" or similar
   - [ ] **Expected:** Console (F12) shows validation error
   - [ ] **Expected:** No new board created
   - [ ] **Fail if:** Import succeeds or app crashes

**Pass Criteria:** Small files import successfully, files >2MB rejected with clear error message

---

### Test 3: Path Traversal Prevention
**Goal:** Verify board IDs are validated (prevents saving files outside boards directory)

**Step-by-step:**

1. **Check current board files:**
   - [ ] Press **Windows Key + R**
   - [ ] Type: `%AppData%\Chronica\boards` and press Enter
   - [ ] File Explorer opens to boards directory
   - [ ] **Expected:** Files named like `board-a1b2c3d4-e5f6-7890-abcd-ef1234567890.json`
   - [ ] **Expected:** All IDs are valid UUIDs (8-4-4-4-12 format with hyphens)
   - [ ] Take note of current file count

2. **Create several boards to test:**
   - [ ] In Chronica, click **"+"** button at top of sidebar
   - [ ] Enter name: "Path Test 1", click OK
   - [ ] Click **"+"** again → "Path Test 2"
   - [ ] Click **"+"** again → "Path Test 3"
   - [ ] Wait 2 seconds for files to save

3. **Verify safe filenames were created:**
   - [ ] Go back to File Explorer (`%AppData%\Chronica\boards`)
   - [ ] Press F5 to refresh
   - [ ] **Expected:** 3 new files, all named `board-{uuid}.json`
   - [ ] **Expected:** No files named with `..` or `/` or `\` characters
   - [ ] **Fail if:** Any file has suspicious characters or paths

4. **Check boards-index.json:**
   - [ ] In File Explorer, go up one level to `%AppData%\Chronica`
   - [ ] Open `boards-index.json` in Notepad
   - [ ] **Expected:** All board IDs are valid UUIDs
   - [ ] Example: `"id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"`
   - [ ] **Fail if:** IDs contain `..`, `/`, `\`, or other path characters

5. **Check for unauthorized files:**
   - [ ] Go to `%AppData%\Chronica`
   - [ ] Check parent directories (go up to `%AppData%`)
   - [ ] **Expected:** No unexpected `.json` files in parent directories
   - [ ] **Fail if:** Files appeared outside the Chronica directory

**Pass Criteria:** All board files use valid UUID format, no files created outside boards directory

---

### Test 4: Temp File Cleanup
**Goal:** Verify `.tmp` files are cleaned up after saves

**Step-by-step:**

1. **Prepare monitoring:**
   - [ ] Press **Windows Key + R**
   - [ ] Type: `%AppData%\Chronica\boards` and press Enter
   - [ ] File Explorer opens to boards directory
   - [ ] Keep this window visible alongside Chronica

2. **Make rapid edits (trigger many saves):**
   - [ ] In Chronica, click any card to edit
   - [ ] Change the title to "Edit 1"
   - [ ] Click **"Save"**
   - [ ] Immediately edit again → "Edit 2" → Save
   - [ ] Repeat 10 times (Edit 3, Edit 4... Edit 10)
   - [ ] Edit as fast as possible (don't wait for save indicator)

3. **Watch File Explorer during edits:**
   - [ ] In File Explorer, press **F5** repeatedly to refresh
   - [ ] **Expected:** You might briefly see files ending in `.tmp`
   - [ ] Example: `board-abc123.json.tmp`
   - [ ] These should appear and disappear very quickly

4. **Wait for saves to complete:**
   - [ ] Stop editing cards
   - [ ] In Chronica header, wait for "✓ Saved" indicator
   - [ ] Wait 5 additional seconds

5. **Check for lingering temp files:**
   - [ ] In File Explorer, press F5 to refresh
   - [ ] Look at all filenames carefully
   - [ ] **Expected:** ONLY `.json` files (no `.tmp` files)
   - [ ] **Fail if:** Any `.json.tmp` files still exist
   - [ ] **Fail if:** Temp files from 1+ minute ago still present

6. **Repeat test with board switching:**
   - [ ] Create 3 boards (if you don't have them)
   - [ ] Edit a card in Board 1 → Switch to Board 2
   - [ ] Edit card in Board 2 → Switch to Board 3
   - [ ] Edit card in Board 3 → Switch to Board 1
   - [ ] Repeat 5 times rapidly
   - [ ] Wait for all saves to complete
   - [ ] Check File Explorer → **Expected:** No `.tmp` files remain

**Pass Criteria:** No `.tmp` files linger after saves complete (within 5 seconds of save indicator showing "✓ Saved")

---

## Phase 1: Foundation & UX

### Test 5: Service Layer Architecture
**Goal:** Verify abstraction works correctly

1. Storage operations:
   - [ ] Create board → saved to disk
   - [ ] Edit card → persisted correctly
   - [ ] Delete board → file removed from disk
2. Window operations:
   - [ ] Pin toggle works (always-on-top)
   - [ ] Opacity slider works (0.7-1.0)
3. Check console:
   - [ ] Logger outputs only in dev mode
   - [ ] No raw console.log in production build

**Pass Criteria:** All operations work, clean abstractions evident

---

### Test 6: Error Boundaries
**Goal:** Verify crashes don't expose stack traces

1. Force error (DevTools Console):
   ```javascript
   // Temporarily break something to test
   window.localStorage.clear(); // Then refresh
   ```
2. Check UI:
   - [ ] Graceful error message displayed
   - [ ] No raw stack trace shown to user
   - [ ] Console has error details (dev mode)
3. Recover:
   - [ ] Close/reopen app
   - [ ] App initializes with defaults

**Pass Criteria:** User sees friendly error, not technical stack trace

---

### Test 7: Import/Export in Sidebar
**Goal:** Verify UX improvement from Phase 1

1. Locate buttons:
   - [ ] Import button in Sidebar (above Settings)
   - [ ] Export button in Sidebar (above Settings)
   - [ ] NOT in Header anymore
2. Functionality:
   - [ ] Import opens file picker
   - [ ] Export saves JSON file
   - [ ] Export disabled when no active board

**Pass Criteria:** Buttons in correct location, work as expected

---

### Test 8: Responsive Kanban Columns
**Goal:** Verify columns stay 100% visible at all window sizes

1. Default size (1000x700):
   - [ ] All 3 columns visible
   - [ ] No horizontal scroll
2. Narrow window (600px wide):
   - [ ] Columns shrink proportionally
   - [ ] All still visible
   - [ ] Min-width prevents unusability
3. Wide window (1920px):
   - [ ] Columns expand to fill space
   - [ ] Layout remains clean

**Pass Criteria:** No horizontal scroll at any size, columns always visible

---

### Test 9: Drag-and-Drop
**Goal:** Verify smooth card movement between columns and within columns

**Step-by-step:**

1. **Setup test cards:**
   - [ ] Ensure you have at least 3 cards in "To Do" column
   - [ ] If not, create 3 cards: "Card A", "Card B", "Card C"
   - [ ] Verify they appear in order top to bottom

2. **Test drag within same column (reorder):**
   - [ ] Click and **hold** on "Card C" (bottom card)
   - [ ] Drag it **above** "Card A" (top card)
   - [ ] **Expected:** Visual feedback shows card being dragged (semi-transparent)
   - [ ] **Expected:** Other cards shift to make room
   - [ ] Release mouse button
   - [ ] **Expected:** "Card C" now at top, order is: C, A, B
   - [ ] **Fail if:** Card snaps back to original position
   - [ ] **Fail if:** Cards overlap or disappear

3. **Test drag between columns (basic):**
   - [ ] Click and **hold** on "Card C"
   - [ ] Drag it **over** the "Doing" column (middle column)
   - [ ] **Expected:** You can move cursor over the column area
   - [ ] Release mouse button while over "Doing" column
   - [ ] **Expected:** "Card C" moves to "Doing" column
   - [ ] **Expected:** Card appears at top or bottom of "Doing"
   - [ ] **Expected:** "To Do" now has 2 cards (A and B)
   - [ ] **Fail if:** Card doesn't move or stays in "To Do"

4. **Test drag to different positions in target column:**
   - [ ] In "To Do", create 3 more cards: "D1", "D2", "D3"
   - [ ] In "Done", create 2 cards: "Done A", "Done B"
   - [ ] Drag "D2" from "To Do" to "Done" column
   - [ ] **Try dropping in different spots:**
     - Above "Done A" (between nothing and Done A)
     - Between "Done A" and "Done B"
     - Below "Done B" (at bottom)
   - [ ] **Expected:** Card inserts at the drop position
   - [ ] **Expected:** Other cards shift to make room
   - [ ] **Fail if:** Card always goes to same position regardless of drop location

5. **Test drag preview (ghost card):**
   - [ ] Click and hold any card
   - [ ] Start dragging slowly
   - [ ] **Expected:** A semi-transparent preview of the card follows your cursor
   - [ ] **Expected:** Original card position shows a placeholder/gap
   - [ ] **Expected:** Cursor may change (grab/grabbing hand)
   - [ ] Release to drop
   - [ ] **Fail if:** No visual feedback during drag
   - [ ] **Fail if:** Card jumps or glitches

6. **Test edge case: Drag to empty column:**
   - [ ] Create a new board (to get empty columns)
   - [ ] Add 1 card to "To Do": "Solo Card"
   - [ ] "Doing" and "Done" columns are empty
   - [ ] Drag "Solo Card" to empty "Done" column
   - [ ] **Expected:** Card moves to "Done" successfully
   - [ ] **Expected:** "Done" column now shows count "(1)"
   - [ ] **Fail if:** Card can't be dropped in empty column

7. **Test edge case: Drag last card from column:**
   - [ ] Have 1 card in "Doing": "Last One"
   - [ ] Drag it to "To Do"
   - [ ] **Expected:** "Doing" becomes empty (shows count "(0)")
   - [ ] **Expected:** Card successfully moves
   - [ ] **Fail if:** Errors occur when emptying a column

8. **Test rapid/multiple drags:**
   - [ ] Create 5 cards in "To Do"
   - [ ] Drag Card 1 to "Doing" → immediately drag Card 2 to "Done"
   - [ ] → immediately drag Card 3 to "Doing" → Card 4 to "Done"
   - [ ] Drag fast without waiting for saves
   - [ ] Wait 3 seconds after last drag
   - [ ] **Expected:** All cards are in correct columns
   - [ ] **Expected:** No duplicate cards
   - [ ] **Expected:** No missing cards
   - [ ] Check header: should show "✓ Saved" (not stuck on "Saving...")
   - [ ] **Fail if:** Cards jump between columns or duplicate

9. **Test drag cancellation:**
   - [ ] Click and hold a card
   - [ ] Start dragging
   - [ ] Press **Escape** key while dragging
   - [ ] **Expected:** Card returns to original position (drag cancelled)
   - [ ] **Note:** If Escape doesn't work, just drag outside the window and release
   - [ ] **Fail if:** Card gets stuck or moves unexpectedly

10. **Verify persistence:**
    - [ ] After all drag operations, close app (Tray → Quit)
    - [ ] Reopen app
    - [ ] **Expected:** All cards are in the columns you dragged them to
    - [ ] **Expected:** Card order preserved
    - [ ] **Fail if:** Cards reset to old positions

**Pass Criteria:**
- Cards drag smoothly between all columns
- Cards can be reordered within columns
- Drag preview shows during drag
- Empty columns accept drops
- Rapid drags don't cause duplicates or conflicts
- Changes persist after restart

---

## Phase 2: Custom Fields

### Test 10: Field Manager (Settings)
**Goal:** Verify custom field CRUD operations

1. Open Settings → Custom Fields tab:
   - [ ] Tab visible and selectable
   - [ ] Empty state or existing fields shown
2. Create text field:
   - [ ] Click "Add Field"
   - [ ] Name: "Priority", Type: "select", Options: "High, Medium, Low"
   - [ ] Save field
   - [ ] Field appears in list
3. Create number field:
   - [ ] Name: "Story Points", Type: "number", Min: 0, Max: 100
4. Create checkbox field:
   - [ ] Name: "Blocked", Type: "checkbox"
5. Edit field:
   - [ ] Click edit on "Priority"
   - [ ] Change options to "Urgent, High, Medium, Low"
   - [ ] Save → changes reflected
6. Delete field:
   - [ ] Delete "Story Points"
   - [ ] Confirm deletion
   - [ ] Field removed from list

**Pass Criteria:** All CRUD operations work, validation enforced

---

### Test 11: Custom Fields in Card Editor
**Goal:** Verify fields render and validate correctly

1. Create/edit card:
   - [ ] Custom fields section appears
   - [ ] All defined fields rendered with correct input type
2. Test select field:
   - [ ] "Priority" dropdown shows all options
   - [ ] Select "High" → saves correctly
3. Test number field (if created):
   - [ ] Input respects min/max bounds
   - [ ] Rejects non-numeric input
4. Test checkbox:
   - [ ] "Blocked" checkbox toggles
   - [ ] State persists on save
5. Required fields:
   - [ ] Create required field in Settings
   - [ ] Try saving card without filling it
   - [ ] Validation error shown

**Pass Criteria:** All field types work, validation prevents bad data

---

### Test 12: Custom Fields in Import/Export
**Goal:** Verify field definitions persist across export/import

1. Export board with custom fields:
   - [ ] Export → Save JSON
   - [ ] Open JSON in text editor
   - [ ] Verify `meta.fields` contains field definitions
   - [ ] Verify cards have `customFields` with values
2. Import to new board:
   - [ ] Create new board
   - [ ] Import exported JSON
   - [ ] Field definitions imported
   - [ ] Card custom field values restored
3. Check Settings:
   - [ ] Custom Fields tab shows imported fields

**Pass Criteria:** Fields definitions and values survive export/import cycle

---

## Phase 3: Always-On Features

### Test 13: System Tray Integration
**Goal:** Verify tray icon, menu, and close-to-tray behavior

**Step-by-step:**

1. **Locate tray icon:**
   - [ ] Look at bottom-right of Windows taskbar (system tray area)
   - [ ] Click the **^** up arrow if icons are hidden
   - [ ] **Expected:** Chronica icon visible (should match app icon)
   - [ ] **Fail if:** No icon appears after 5 seconds

2. **Test tray menu:**
   - [ ] **Right-click** the Chronica tray icon
   - [ ] **Expected:** Context menu appears
   - [ ] **Expected:** Menu shows these items (in order):
     - "Show/Hide"
     - "Settings"
     - (separator line)
     - "Quit"
   - [ ] Click outside menu to close it
   - [ ] **Fail if:** Menu doesn't appear or items are missing

3. **Test Show/Hide from menu:**
   - [ ] Ensure Chronica window is visible
   - [ ] Right-click tray icon → click **"Show/Hide"**
   - [ ] **Expected:** Window disappears (minimizes to tray)
   - [ ] **Expected:** Tray icon still visible
   - [ ] Right-click tray icon again → click **"Show/Hide"**
   - [ ] **Expected:** Window reappears in same position
   - [ ] **Fail if:** Window closes instead of hiding

4. **Test Settings from tray:**
   - [ ] Hide the window (right-click tray → "Show/Hide")
   - [ ] Right-click tray icon → click **"Settings"**
   - [ ] **Expected:** Window reappears
   - [ ] **Expected:** Settings modal opens automatically
   - [ ] **Expected:** Window gets focus (comes to front)
   - [ ] Click X to close Settings modal
   - [ ] **Fail if:** Window doesn't show or Settings doesn't open

5. **Test tray left-click toggle:**
   - [ ] Window is visible
   - [ ] **Left-click** (single click) the tray icon
   - [ ] **Expected:** Window hides to tray
   - [ ] **Left-click** tray icon again
   - [ ] **Expected:** Window shows again
   - [ ] Repeat 3 times to verify consistent behavior
   - [ ] **Fail if:** Nothing happens or behavior is inconsistent

6. **CRITICAL TEST: Close-to-tray (X button):**
   - [ ] Ensure window is visible
   - [ ] Open **Task Manager** (Ctrl+Shift+Esc)
   - [ ] Find "Chronica" in Processes tab
   - [ ] Note the process exists
   - [ ] **Click the X button** in top-right of Chronica window
   - [ ] **Expected:** Window disappears (hides)
   - [ ] **Expected:** Tray icon STILL visible
   - [ ] **Expected:** Process STILL in Task Manager
   - [ ] **Expected:** NO confirmation dialog
   - [ ] Left-click tray icon to show window again
   - [ ] **Fail if:** App quits (process disappears from Task Manager)
   - [ ] **Fail if:** Tray icon disappears
   - [ ] **This is the most important test - X must hide, not quit!**

7. **Test proper Quit:**
   - [ ] Right-click tray icon → click **"Quit"**
   - [ ] **Expected:** Window closes if visible
   - [ ] **Expected:** Tray icon disappears
   - [ ] **Expected:** Process removed from Task Manager
   - [ ] **Expected:** App fully terminated
   - [ ] **Fail if:** App still running or tray icon remains

**Pass Criteria:**
- X button hides to tray (doesn't quit)
- Only "Quit" menu item fully exits the app
- Tray icon always visible while app runs
- Left-click and menu controls work correctly

---

### Test 14: Save Queue with Retry
**Goal:** Verify retry logic on save failures

1. Normal save:
   - [ ] Edit card title
   - [ ] Header shows "Saving..."
   - [ ] Changes to "✓ Saved" after ~500ms
2. **Simulate save failure:**
   - Open `%AppData%\Chronica\boards\`
   - Lock a board file (open in Notepad, don't close)
   - Edit that board's card in Chronica
   - [ ] Header shows "Saving..."
   - [ ] Retries 3 times (watch console: 0ms, 1s, 2s delays)
   - [ ] After 3 failures: "⚠ Failed" shown
   - [ ] Alert dialog: "Save Failed: ..."
3. Unlock file:
   - Close Notepad
   - Edit card again
   - [ ] Save succeeds this time

**Pass Criteria:** Retries 3x with exponential backoff, clear error on final failure

---

### Test 15: Save Status Indicator
**Goal:** Verify visual feedback in Header

1. Rapid edits:
   - [ ] Edit 5 cards quickly
   - [ ] Header cycles: "Saving..." → "✓ Saved"
2. Status colors:
   - [ ] "Saving..." = gray/secondary color
   - [ ] "✓ Saved" = cyan color
   - [ ] "⚠ Failed" = salmon/red color (if triggered)
3. Hover failed status:
   - [ ] If failed, hover shows error tooltip

**Pass Criteria:** Clear visual feedback, correct colors, helpful error messages

---

### Test 16: Backup Rotation
**Goal:** Verify max 5 backups kept per board (oldest deleted automatically)

**Step-by-step:**

1. **Create test board and find its ID:**
   - [ ] In Chronica, click **"+"** button in sidebar
   - [ ] Name it "Backup Test Board"
   - [ ] Click OK
   - [ ] Wait 2 seconds for save
   - [ ] Open File Explorer: **Windows Key + R** → `%AppData%\Chronica` → Enter
   - [ ] Open `boards-index.json` in Notepad
   - [ ] Find "Backup Test Board" entry
   - [ ] Copy the UUID (example: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
   - [ ] **Write down this UUID** - you'll need it

2. **Prepare backups folder monitoring:**
   - [ ] Open File Explorer: **Windows Key + R** → `%AppData%\Chronica\boards\backups` → Enter
   - [ ] This folder should exist (if empty, that's OK)
   - [ ] Keep this window visible

3. **Create multiple saves (trigger backups):**
   - [ ] In "Backup Test Board", create 1 card: "Test Card"
   - [ ] Edit the card, change title to "Version 1", Save
   - [ ] Immediately edit again → "Version 2" → Save
   - [ ] Continue editing: "Version 3", "Version 4", "Version 5", "Version 6", "Version 7"
   - [ ] Keep going: "Version 8", "Version 9", "Version 10"
   - [ ] **Edit as fast as possible** (don't wait between saves)
   - [ ] Wait for save indicator to show "✓ Saved"
   - [ ] Wait 5 additional seconds

4. **Check backups folder:**
   - [ ] Go to backups folder in File Explorer (`%AppData%\Chronica\boards\backups`)
   - [ ] Press F5 to refresh
   - [ ] Look for files starting with `board-{your-uuid}-`
   - [ ] **Expected:** Files named like `board-abc123-2025-01-25T13-45-30-123Z.json`
   - [ ] **Expected:** EXACTLY 5 files for your board (not 10!)
   - [ ] Count the files - there should be only 5
   - [ ] **Fail if:** More than 5 backup files exist for this board
   - [ ] **Fail if:** Less than 5 exist (unless you made <5 edits)

5. **Verify backup rotation (oldest deleted):**
   - [ ] Sort backups folder by Date Modified (oldest first)
   - [ ] Look at the 5 backup files for your board
   - [ ] **Expected:** The 5 NEWEST backups are kept
   - [ ] **Expected:** Timestamps show recent times (last few seconds)
   - [ ] **Fail if:** Old timestamps from minutes ago still exist

6. **Verify backup content (newest):**
   - [ ] Right-click the **newest** backup (most recent timestamp)
   - [ ] Open with Notepad
   - [ ] Search for "Version" in the file
   - [ ] **Expected:** Should contain "Version 9" (one before "Version 10")
   - [ ] **Note:** Backups capture state BEFORE the current save
   - [ ] Close Notepad

7. **Verify backup content (oldest):**
   - [ ] Right-click the **oldest** of the 5 backups
   - [ ] Open with Notepad
   - [ ] **Expected:** Should contain an earlier version (like "Version 5" or "Version 6")
   - [ ] **Expected:** Should NOT contain "Version 10"
   - [ ] Close Notepad

8. **Test with multiple boards (isolation):**
   - [ ] Create a 2nd board: "Backup Test 2"
   - [ ] Add a card, edit title 10 times (Version 1-10)
   - [ ] Wait for saves to complete
   - [ ] Check backups folder
   - [ ] **Expected:** 5 backups for Board 1 + 5 backups for Board 2 = 10 total files
   - [ ] **Expected:** Each board's UUID has exactly 5 backups
   - [ ] **Fail if:** Boards share backups or exceed 5 each

**Pass Criteria:**
- Maximum 5 backups per board
- Oldest backups automatically deleted when >5 exist
- Each board's backups are independent
- Backups contain correct previous versions

---

### Test 17: Backup Before Save
**Goal:** Verify backup created before each save

1. Create board with 1 card
2. Edit card title to "Version 1"
3. Check backups folder:
   - [ ] New backup file created
   - [ ] Contains "Version 1"
4. Edit title to "Version 2"
5. Check backups again:
   - [ ] New backup with "Version 1" exists
   - [ ] Current board has "Version 2"

**Pass Criteria:** Backups capture state BEFORE save (not after)

---

### Test 18: Performance Optimizations
**Goal:** Verify reduced re-renders and smooth interactions

1. Open DevTools → Performance tab
2. Drag card 10 times rapidly:
   - [ ] No lag or stutter
   - [ ] UI responsive throughout
3. Create 50 cards in one column:
   - [ ] Scroll smooth
   - [ ] Drag-drop still fast
4. Edit card with many custom fields:
   - [ ] Typing feels instant
   - [ ] No input lag

**Pass Criteria:** <100ms response, smooth at scale (50+ cards)

---

### Test 19: Autostart (Windows)
**Goal:** Verify app launches on login

**⚠️ IMPORTANT:** This requires Windows restart/logout

1. Open Settings → General:
   - [ ] "Start Chronica on login" checkbox visible
   - [ ] Currently unchecked
2. Enable autostart:
   - [ ] Check the box
   - [ ] No errors in console
3. Check registry (optional):
   - Win+R → `regedit`
   - Navigate: `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run`
   - [ ] "Chronica" entry exists
4. **Restart Windows**
5. After login:
   - [ ] Chronica launches automatically
   - [ ] Starts minimized to tray (--minimized flag)
   - [ ] No window visible initially
6. Disable autostart:
   - [ ] Open Chronica → Settings → Uncheck
   - [ ] Restart Windows
   - [ ] App does NOT launch

**Pass Criteria:** Launches on login when enabled, respects toggle

---

### Test 20: Window State Persistence
**Goal:** Verify position/size restored on relaunch

1. Move window to specific position (e.g., top-left corner)
2. Resize to 800x600
3. Close app (tray → Quit)
4. Relaunch app:
   - [ ] Window appears at same position (top-left)
   - [ ] Window is same size (800x600)
5. Move to different monitor (if multi-monitor):
   - [ ] Close/relaunch
   - [ ] Restores on correct monitor

**Pass Criteria:** Position and size persist across launches

---

## Core Features (Existing)

### Test 21: Board Management
**Goal:** Verify board CRUD operations

1. Create board:
   - [ ] Sidebar → "+" button
   - [ ] Enter name "Test Board"
   - [ ] Board created and becomes active
2. Switch boards:
   - [ ] Create 2nd board
   - [ ] Click between boards in sidebar
   - [ ] Correct board becomes active
3. Rename board:
   - [ ] Right-click board → Rename (or similar)
   - [ ] Change name → saved
4. Delete board:
   - [ ] Delete "Test Board"
   - [ ] Confirm deletion
   - [ ] Board removed from sidebar + disk

**Pass Criteria:** All board operations work, persist correctly

---

### Test 22: Card CRUD Operations
**Goal:** Verify basic card management

1. Create card:
   - [ ] Click "+ Add Card" in "To Do" column
   - [ ] Enter title "Test Task"
   - [ ] Optional: Add description, select color
   - [ ] Save → card appears in column
2. Edit card:
   - [ ] Click existing card
   - [ ] Modify title, description, color, column
   - [ ] Save → changes reflected
3. Move card via editor:
   - [ ] Edit card → Change column dropdown
   - [ ] Save → card moves to new column
4. Delete card:
   - [ ] Edit card → Click "Delete"
   - [ ] Confirm → card removed

**Pass Criteria:** All CRUD operations work as expected

---

### Test 23: Multiple Boards & Cards
**Goal:** Verify data isolation and scale

1. Create 3 boards:
   - Board A: 10 cards across all columns
   - Board B: 5 cards in "To Do"
   - Board C: Empty board
2. Switch between boards:
   - [ ] Each board shows only its cards
   - [ ] No data leakage between boards
3. Edit Board A card:
   - [ ] Switch to Board B → no changes
   - [ ] Back to Board A → edit persisted

**Pass Criteria:** Boards independent, data isolated correctly

---

### Test 24: Settings Modal
**Goal:** Verify all settings work

1. Open Settings (gear icon or sidebar):
   - [ ] Modal opens
2. General tab:
   - [ ] Autostart toggle works (see Test 19)
   - [ ] "Show starter cards" toggle
   - [ ] About section shows version
3. Custom Fields tab (see Test 10)
4. Close modal:
   - [ ] Click X or outside → closes
   - [ ] Settings persist on reopen

**Pass Criteria:** All settings functional, persist correctly

---

### Test 25: Header Controls
**Goal:** Verify pin and opacity controls

1. Pin toggle:
   - [ ] Click pin button → window always-on-top
   - [ ] Other windows can't cover Chronica
   - [ ] Click again → normal behavior restored
2. Opacity slider:
   - [ ] Drag to 0.7 → window semi-transparent
   - [ ] Drag to 1.0 → fully opaque
   - [ ] Setting persists on restart

**Pass Criteria:** Both controls work, settings persist

---

## Edge Cases & Stress Tests

### Test 26: Empty States
**Goal:** Verify graceful handling of empty data

1. No boards:
   - [ ] Delete all boards
   - [ ] Message: "Create a new board..."
2. Empty board:
   - [ ] Create board with no cards
   - [ ] Each column shows "Empty" state or similar
3. No custom fields:
   - [ ] Settings → Custom Fields → empty state message

**Pass Criteria:** Helpful messages, no crashes on empty data

---

### Test 27: Large Data Sets
**Goal:** Verify performance at schema limits

1. Max cards (schema limit: 3000):
   - Create board with 1000 cards (split across columns)
   - [ ] App remains responsive
   - [ ] Scroll smooth
   - [ ] Saves don't timeout
2. Max boards (schema limit: 20):
   - Create 20 boards
   - [ ] Sidebar handles overflow (scroll?)
   - [ ] Switching boards still fast
3. Max custom fields (20):
   - Create 20 custom fields
   - [ ] Card editor handles many fields
   - [ ] Validation still works

**Pass Criteria:** Handles limits gracefully, no crashes or extreme slowdown

---

### Test 28: Rapid Operations
**Goal:** Verify race condition handling

1. Rapid card creation:
   - [ ] Click "+ Add Card" 10 times quickly
   - [ ] All cards created with unique IDs
2. Rapid board switches:
   - [ ] Switch between boards 20x rapidly
   - [ ] No data corruption
   - [ ] Correct board always displayed
3. Rapid drag-drop:
   - [ ] Drag 5 cards between columns in quick succession
   - [ ] All moves complete correctly
   - [ ] No rank calculation errors

**Pass Criteria:** No race conditions, data integrity maintained

---

### Test 29: Invalid Data Handling
**Goal:** Verify resilience to corrupted data

1. Corrupt boards-index.json:
   - Close app
   - Edit `%AppData%\Chronica\boards-index.json` → add invalid JSON
   - Relaunch app
   - [ ] App handles gracefully (resets to default?)
   - [ ] No crash
2. Corrupt board file:
   - Edit a board file → break JSON syntax
   - Switch to that board
   - [ ] Error message shown
   - [ ] App doesn't crash
   - [ ] Can still use other boards

**Pass Criteria:** Graceful error handling, no crashes on bad data

---

### Test 30: Import Edge Cases
**Goal:** Verify import validation

1. Import invalid schema:
   ```json
   {"invalid": "structure"}
   ```
   - [ ] Rejected with clear error message
2. Import missing required fields:
   ```json
   {"meta": {}, "columns": [], "cards": []}
   ```
   - [ ] Validation error shown
3. Import duplicate board:
   - Export board A
   - Import same file twice
   - [ ] Creates 2nd board (or prompts for merge?)

**Pass Criteria:** Invalid imports rejected with helpful errors

---

## Final Verification Checklist

### Production Build Test
- [ ] Build production version: `pnpm build && pnpm tauri build`
- [ ] Install generated `.msi` or `.exe`
- [ ] Run installed app (not dev mode)
- [ ] Verify all features work in production
- [ ] No console.log spam in production

### Data Persistence
- [ ] Create board with 5 cards + custom fields
- [ ] Close app (Quit from tray)
- [ ] Check `%AppData%\Chronica\` → files exist
- [ ] Relaunch → all data restored

### Security Verification
- [ ] No XSS vulnerabilities found
- [ ] File size limits enforced
- [ ] Path traversal prevented
- [ ] Temp files cleaned up

### Performance Verification
- [ ] App launches in <3 seconds
- [ ] Board loads in <2 seconds (1000 cards)
- [ ] Drag-drop response <100ms
- [ ] Memory usage <100MB with 20 boards

### Always-On Verification
- [ ] Autostart works (after Windows restart)
- [ ] Tray icon always visible
- [ ] X button hides to tray (doesn't quit)
- [ ] Window state persists
- [ ] Backups rotate correctly (max 5)
- [ ] Save retry works (3 attempts)

---

## Bug Reporting Template

If you find issues, document them:

```markdown
**Issue:** [Brief description]
**Severity:** Critical / High / Medium / Low
**Steps to Reproduce:**
1. Step one
2. Step two
3. Expected vs Actual result

**Environment:**
- Chronica version: v0.1.0-alpha
- OS: Windows [version]
- Build: Dev / Production

**Console Errors:** [Paste any errors]
**Screenshots:** [If applicable]
```

---

## Testing Complete!

**Estimated Time:** 3-4 hours for thorough testing

Once all tests pass:
- [ ] Document any issues found
- [ ] Create GitHub issues for bugs
- [ ] Update improvement-plan.md with findings
- [ ] Proceed to Phase 4 (testing framework, polish)

**Good luck testing! 🚀**
