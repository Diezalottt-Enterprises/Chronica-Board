# ADR 002: Testing Framework - Vitest

**Date:** 2025-01-26
**Status:** Accepted
**Deciders:** Development Team

## Context

Project had no testing infrastructure. Needed to establish testing framework compatible with Vite and TypeScript for pre-GitLab readiness.

## Decision

Adopt **Vitest** as the primary testing framework with:

- **@testing-library/react** for component testing
- **happy-dom** as test environment
- **v8** coverage provider
- Minimum 50% coverage thresholds (to grow over time)

## Rationale

1. **Vite Native**: Vitest shares Vite's config and transformation pipeline
2. **Speed**: Extremely fast, watch mode optimized
3. **TypeScript**: First-class TS support, no babel needed
4. **API Familiarity**: Jest-compatible API, low learning curve
5. **Modern**: Active development, growing ecosystem

## Alternatives Considered

1. **Jest**
   - Rejected: Requires additional babel/ts-jest config
   - Slower than Vitest for Vite projects
   - Still viable, but Vitest better integrated

2. **Playwright** (for E2E only)
   - Deferred: Will add later for integration tests
   - Vitest handles unit/component layer

## Consequences

**Positive:**

- Fast test execution (<1s for current suite)
- Shared config with Vite (DRY)
- Coverage reporting out-of-box
- Watch mode with HMR

**Negative:**

- Smaller ecosystem than Jest (but growing)
- Some edge cases less documented

**Implementation:**

- Created vitest.config.ts
- Added test:\*, test:coverage scripts
- Initial tests for utils/ functions
- CI integration ready
