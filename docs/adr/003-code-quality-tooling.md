# ADR 003: Code Quality Tooling - ESLint + Prettier

**Date:** 2025-01-26
**Status:** Accepted
**Deciders:** Development Team

## Context

No linting or formatting enforcement existed. Required automated code quality checks for GitLab CI and contributor consistency.

## Decision

Implement **ESLint 9** (flat config) + **Prettier** with:

**ESLint:**

- `typescript-eslint` recommended type-checked rules
- React hooks and refresh plugins
- Pragmatic rule adjustments (no-floating-promises: off)
- eqeqeq and no-console warnings

**Prettier:**

- Semi: true, singleQuote: false, printWidth: 100
- trailingComma: es5, endOfLine: lf

## Rationale

1. **Industry Standard**: ESLint + Prettier de facto for TS/React
2. **Type Safety**: TypeScript-aware linting catches bugs
3. **Auto-Fix**: ~70% of issues fixable automatically
4. **CI Integration**: Blocks merges on violations
5. **Consistency**: Eliminates style debates

## Configuration Philosophy

- **Pragmatic over purist**: Disabled overly strict rules (floating-promises, misused-promises) that caused false positives in React event handlers
- **Warnings not errors**: Console.log as warnings (useful for debugging)
- **Focus on correctness**: Enforce eqeqeq, type safety, unused vars

## Alternatives Considered

1. **Biome** (Rust-based, fast)
   - Rejected: Newer, smaller ecosystem
   - May reconsider in future

2. **Standard.js** (zero-config)
   - Rejected: Less flexible, opinionated style

## Consequences

**Positive:**

- 30 warnings, 0 errors after setup (acceptable baseline)
- Automated formatting saves time
- CI catches issues before review
- Onboarding easier with clear style

**Negative:**

- Initial setup time
- Some rules subjective (complexity limits disabled)

**Scripts Added:**

- `pnpm lint`, `pnpm lint:fix`
- `pnpm format`, `pnpm format:fix`
- `pnpm typecheck`
