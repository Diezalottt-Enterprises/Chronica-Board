# Contributing to Chronica

Thank you for considering contributing to Chronica!

## Development Setup

### Prerequisites

- **Node.js** 22+ and **pnpm** 9+
- **Rust** (latest stable)
- **Git**

### Getting Started

```bash
# Clone the repository
git clone https://gitlab.com/your-org/chronica.git
cd chronica

# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev
```

## Development Workflow

### Code Quality Checks

Before committing, ensure all checks pass:

```bash
pnpm typecheck  # TypeScript validation
pnpm lint       # ESLint
pnpm format     # Prettier formatting
pnpm test       # Vitest tests
pnpm build      # Production build
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add custom field validation
fix: resolve drag-and-drop flicker
docs: update README installation steps
refactor: extract column header to component
test: add sanitize utility tests
chore: update dependencies
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semi-colons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or updating tests
- `chore`: Updating build tasks, package manager configs, etc.

### Coding Standards

- **TypeScript**: Strict mode enabled
- **Style**: Enforced by ESLint + Prettier
- **Tests**: Add tests for new functionality
- **Comments**: Document complex logic, explain "why" not "what"

### File Organization

```
/src
  /ui            # React components
  /stores        # Zustand state stores
  /services      # Business logic
  /io            # Persistence, import/export
  /platform      # Tauri/OS integration
  /state         # Type definitions
  /constants     # App constants
  /utils         # Pure utility functions
/tauri           # Rust backend
/tests           # Test files
/docs            # Documentation
```

### Pull Requests

1. **Create a feature branch**: `git checkout -b feat/my-feature`
2. **Make changes** with clear, focused commits
3. **Run quality checks**: `pnpm typecheck && pnpm lint && pnpm test`
4. **Push and open MR**: Target `main` branch
5. **Describe changes**: What, why, and how
6. **Wait for CI**: All checks must pass

### Testing

- Write tests for new features and bug fixes
- Maintain or improve code coverage
- Unit tests for utilities and services
- Integration tests for complex flows

## Reporting Issues

When reporting bugs, include:

- Chronica version
- Operating system and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## Questions?

Open a discussion or issue on GitLab.
