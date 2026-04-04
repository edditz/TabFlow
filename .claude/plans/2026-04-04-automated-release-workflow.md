# Automated Release Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up a two-part release system: a local `/release` skill for version analysis + tag creation, and a GitHub Actions workflow for build + publish.

**Architecture:** Local Claude skill handles interactive parts (AI commit analysis, version bump, release notes generation). GitHub Actions handles deterministic parts (build, zip, create release). Communication happens through annotated git tags — the skill writes release notes into the tag body, and the workflow reads it back.

**Tech Stack:** Claude Code skill (markdown), GitHub Actions (YAML), git annotated tags

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `.github/workflows/release.yml` | Create | GitHub Actions workflow: build, zip, create release |
| `.claude/skills/release.md` | Create | `/release` skill: AI analysis, version bump, tag push |

---

### Task 1: Create GitHub Actions Release Workflow

**Files:**
- Create: `.github/workflows/release.yml`

- [ ] **Step 1: Create workflow file**

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Package zip
        run: |
          VERSION="${GITHUB_REF_NAME#v}"
          cd dist
          zip -r "../tabflow-v${VERSION}.zip" .

      - name: Extract release notes from tag
        run: |
          git for-each-ref "refs/tags/${GITHUB_REF_NAME}" \
            --format='%(contents)' \
            | sed '/^$/d' > release-notes.md

      - name: Create GitHub Release
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          VERSION="${GITHUB_REF_NAME#v}"
          gh release create "${GITHUB_REF_NAME}" \
            "tabflow-v${VERSION}.zip" \
            --title "TabFlow v${VERSION}" \
            --notes-file release-notes.md
```

- [ ] **Step 2: Verify YAML syntax**

Run: `cat .github/workflows/release.yml | python3 -c "import yaml, sys; yaml.safe_load(sys.stdin); print('YAML is valid')"`

Expected: `YAML is valid`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "ci: add release workflow for automated build and publish"
```

---

### Task 2: Create the `/release` Skill

**Files:**
- Create: `.claude/skills/release.md`

- [ ] **Step 1: Create skill file**

```markdown
---
name: release
description: Analyze commits since last release, determine semver bump, generate release notes, create tag, and trigger GitHub Actions build
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
2. Provide the GitHub Actions URL: `gh run list --workflow=release.yml --limit=1 --json url --jq '.[0].url'`
3. Optionally monitor: `gh run watch`
4. Once complete, provide the release URL.
```

- [ ] **Step 2: Verify skill is discoverable**

Run: `cat .claude/skills/release.md | head -5`

Expected: See the frontmatter with `name: release` and `description:` fields.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/release.md
git commit -m "feat: add /release skill for automated version analysis and tagging"
```

---

### Task 3: Push and Verify

- [ ] **Step 1: Push to GitHub**

```bash
git push
```

- [ ] **Step 2: Verify workflow is recognized**

```bash
gh workflow list
```

Expected: See `Release` workflow listed.

- [ ] **Step 3: Verify skill is invocable**

In Claude Code, type `/release` and confirm the skill content is loaded.

---

## Verification Checklist

After all tasks are complete:

- [ ] `.github/workflows/release.yml` exists and YAML is valid
- [ ] `.claude/skills/release.md` exists with correct frontmatter
- [ ] `gh workflow list` shows the Release workflow
- [ ] `/release` command loads the skill in Claude Code
- [ ] `package.json` version and `manifest.json` version are both still `1.0.0` (unchanged until first release)
