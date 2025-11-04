// Centralized version management for Chronica
// This is the single source of truth for version numbers

/**
 * App version - update here only
 */
export const VERSION = "0.1.0-alpha.7" as const;

/**
 * Version with 'v' prefix for display
 */
export const VERSION_DISPLAY = `v${VERSION}` as const;

/**
 * Version for filenames (no 'v' prefix)
 */
export const VERSION_FILENAME = VERSION;

/*VERSION REFERENCES INVENTORY

       Current Version State

       - src/version.ts: 0.1.0-alpha.3 ✅ (Single source of truth)
       - package.json: 0.1.0-alpha.3 ✅ (Synced)
       - tauri/tauri.conf.json: 0.1.0 ⚠️ MISMATCH (missing -alpha.3)
       - CLAUDE.md: References v0.1.0-alpha ⚠️ OUTDATED (should be .3)
       - README.md: References v0.1.0-alpha ⚠️ OUTDATED (should be .3)
       - CHANGELOG: Has 0.1.0-alpha.3 entry ✅

       How Each File Gets Version

       1. src/version.ts → Manual (PRIMARY SOURCE)
       2. package.json → Auto-synced via scripts/sync-version.js (before build)
       3. tauri/tauri.conf.json → Manual ❌ NOT SYNCED
       4. CLAUDE.md → Manual ❌ NOT SYNCED
       5. README.md → Manual ❌ NOT SYNCED
       6. CHANGELOG → Manual ❌ NOT SYNCED

       Version Import Chain

       - src/version.ts exports VERSION, VERSION_DISPLAY, VERSION_FILENAME
       - Imported by:
         - src/state/store.ts (for default config)
         - src/stores/configStore.ts (for default config)
         - src/ui/SettingsModal.tsx (for display)
         - src/io/importExport.ts (for export metadata)
*/
