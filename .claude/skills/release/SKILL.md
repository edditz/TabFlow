---
name: release
description: Analyze commits since last release, determine semver bump, generate release notes, create tag, and trigger GitHub Actions build
user-invocable: true
---

# Release Skill

When the user invokes `/release`, execute the following workflow step by step. Stop and ask for confirmation at each user interaction point.

## Step 1: Environment Check

Run these checks in order. If any fails, tell the user what to fix and STOP.

```bash
# Check gh CLI
which gh || { echo "ERROR: gh CLI not installed. Run: brew install gh"; exit 1; }

# Check gh authentication
gh auth status || { echo "ERROR: gh not authenticated. Run: gh auth login"; exit 1; }

# Check git remote
git remote get-url origin || { echo "ERROR: No git remote configured"; exit 1; }
```

If all pass, proceed to Step 2.

## Step 2: Collect Commits

Run:
```bash
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
```

If `LAST_TAG` is empty:
- Inform user: "No previous release tag found."
- Read current version from `package.json` as the base version.
- Collect ALL commits: `git log --format="%s"`
- This will be the initial release.

If `LAST_TAG` is set:
- Show: "Last release: {LAST_TAG}"
- Collect commits since last tag: `git log ${LAST_TAG}..HEAD --format="%s"`
- If no commits: inform "No new commits since {LAST_TAG}" and STOP.

Show the user the collected commit list.

## Step 3: AI Semver Analysis

Analyze the collected commit messages and determine the version bump:

| Pattern | Bump |
|---------|------|
| Any commit with `!` after type (e.g. `feat!:`) or `BREAKING CHANGE` in body | **major** (x.0.0) |
| Any `feat:` commit | **minor** (0.x.0) |
| Any `fix:` commit | **patch** (0.0.x) |
| Only `chore:/docs:/refactor:/style:/test:/perf:/ci:` | **no bump** — inform user and ask how to proceed |

If multiple bump levels apply, use the highest.

Calculate the new version number. Present to the user:

```
Version Analysis
────────────────
Base version: {current} (from package.json)
Suggested bump: {major|minor|patch}
New version: {new_version}

Changes:
  feat:  {count} commits
  fix:   {count} commits
  other: {count} commits
```

Ask: "Accept this version? (Enter to confirm, or type a different version number)"

Wait for user confirmation before proceeding.

## Step 4: Update Version Files

Update version in TWO files — they MUST stay in sync:

1. `package.json` — update the `"version"` field
2. `manifest.json` — update the `"version"` field

Use the Edit tool to change both files. Do NOT proceed if either file fails to update.

## Step 5: Generate Release Notes

Based on all collected commits, generate bilingual release notes in this exact format:

````markdown
## TabFlow v{version}

### 🚀 New Features | 新功能

- {English description} ({中文描述})

### 🐛 Bug Fixes | Bug 修复

- {English description} ({中文描述})

### 🔧 Other Changes | 其他变更

- {English description} ({中文描述})
````

Rules:
- Group commits by type: Features → Bug Fixes → Other
- Each bullet: English description first, Chinese translation in parentheses
- Omit sections with no entries (e.g., if no bug fixes, skip that section entirely)
- Exclude pure technical changes (chore, refactor) from the notes UNLESS they are user-facing
- For the initial release, write a general summary instead of listing all commits

Show the generated notes to the user and ask:
"Review the release notes above. Edit or approve? (Enter to approve, or provide modifications)"

Wait for user approval.

## Step 6: Commit, Tag, Push

Execute these commands in sequence. STOP before push and ask for final confirmation.

```bash
# Stage version changes
git add package.json manifest.json

# Commit
git commit -m "chore: release v{version}"

# Create annotated tag with release notes as the body
# Use a temp file to avoid shell escaping issues
cat > /tmp/release-notes.txt << 'RELEASE_NOTES_EOF'
{release_notes_content}
RELEASE_NOTES_EOF
git tag -a "v{version}" -F /tmp/release-notes.txt
```

Ask the user: "Ready to push tag v{version} to origin? This will trigger the GitHub Actions release workflow. (y/n)"

If user confirms:
```bash
git push
git push --tags
```

## Step 7: Post-Push

After pushing:
1. Inform user: "Tag v{version} pushed. GitHub Actions release workflow has been triggered."
2. Provide the GitHub Actions URL: `gh run list --workflow=release.yml --limit 1 --json url --jq '.[0].url'`
3. Optionally monitor: `gh run watch`
4. Once complete, provide the release URL.
