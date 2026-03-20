# Git Workflow

## Commit Message Format (Conventional Commits 1.0.0)

```
<type>: <description>
```

### Types

| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change (no feat/fix) |
| `docs` | Documentation only |
| `style` | Formatting (no code change) |
| `test` | Adding/updating tests |
| `chore` | Build, tooling, deps |
| `perf` | Performance improvement |

### Rules

- Use **imperative mood**: "add" not "added"
- **Lowercase** description
- No period at end
- Body (optional): separate with blank line, explain what/why

### Examples

```
feat: add tab search functionality
fix: resolve memory leak in content script
refactor: extract tab filtering logic
docs: update installation guide
test: add unit tests for tab manager
```
