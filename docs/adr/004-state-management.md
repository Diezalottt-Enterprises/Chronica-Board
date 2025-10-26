# ADR 004: State Management - Zustand

**Date:** 2025-01-26
**Status:** Accepted (Existing)
**Deciders:** Original Project Team

## Context

Desktop application with persistent state across boards, UI config, and user preferences. Needed simple, performant state management.

## Decision

Use **Zustand** for global state with three stores:

- `boardStore`: Boards, cards, columns, CRUD operations
- `configStore`: App settings, window state, UI preferences
- `uiStore`: Transient UI state (modals, dialogs)

## Rationale

1. **Simplicity**: Minimal boilerplate vs Redux
2. **Performance**: Selective re-renders, no Context Provider wrapping
3. **TypeScript**: Excellent TS support, type inference
4. **Size**: ~3KB bundle, negligible overhead
5. **DevTools**: Optional Redux DevTools integration

## Architecture

- **Stores are independent**: No inter-store dependencies
- **Actions co-located with state**: Easy to reason about
- **Persist integration**: Used for boardStore and configStore
- **React hooks**: `useStore(selector)` pattern minimizes re-renders

## Alternatives Considered

1. **Redux Toolkit**
   - Rejected: Too heavyweight for app size
   - More boilerplate than necessary

2. **Jotai/Recoil**
   - Rejected: Atom-based model unnecessary
   - Prefer store-based for this use case

3. **React Context**
   - Rejected: Performance issues with frequent updates
   - No built-in persistence

## Consequences

**Positive:**

- Clear separation of concerns (3 stores)
- Easy to test (plain functions)
- Small bundle impact
- Fast performance

**Negative:**

- No built-in middleware (not needed currently)
- Less opinionated than Redux (can lead to inconsistency)

**Notes:**

- This ADR documents existing decision
- Zustand working well, no changes planned
