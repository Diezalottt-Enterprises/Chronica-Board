# ADR 001: Repository Structure - Single App Layout

**Date:** 2025-01-26
**Status:** Accepted
**Deciders:** Development Team

## Context

Chronica-CC started with multiple `src*` directories (src, src-tauri, srcio, srcplatform, srcstate, srcui) creating confusion. Needed to normalize structure for GitLab upload and future maintainability.

## Decision

Adopt **single-app repository** structure:

```
/src          # TypeScript/React application code
/tauri        # Rust backend (moved from src-tauri)
/public       # Static assets
/tests        # Test files
/docs         # Documentation and ADRs
```

Removed empty obsolete directories: srcio, srcplatform, srcstate, srcui.

## Rationale

- **Clarity**: Single source of truth for app code
- **Simplicity**: Not a monorepo, no need for packages/\*
- **Convention**: Aligns with Tauri and Vite expectations
- **Maintainability**: Easier for new contributors to navigate

## Alternatives Considered

1. **Multi-package workspace** (apps/, packages/)
   - Rejected: Overkill for single-app project
   - Would add complexity without clear benefit

2. **Keep src-tauri naming**
   - Rejected: `tauri` is clearer and shorter

## Consequences

**Positive:**

- Clear, conventional structure
- Easier onboarding for contributors
- Better alignment with tooling expectations

**Negative:**

- Requires one-time path updates in configs
- Breaking change for existing dev environments (if any)

**Migration:**

- Updated vite.config.ts, tauri.conf.json
- Verified build and dev workflows
