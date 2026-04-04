# Automated Release Workflow Design

## Overview

AI-powered release automation for TabFlow. The workflow splits into two parts: local Claude handles version analysis and tag creation, GitHub Actions handles build and publishing.

## Architecture

```
Local Claude (/release)              GitHub Actions (on tag push)
─────────────────────               ────────────────────────────
1. Detect last tag                   1. Checkout tag
2. Collect commits                   2. npm ci && npm run build
3. AI analyze → semver bump          3. Package zip
4. User confirms version             4. Create GitHub Release
5. Update package.json + manifest    5. Upload zip artifact
6. AI generates Release Notes
7. User reviews Notes
8. Commit + tag + push
```

## 1. Release Skill (Local `/release`)

### Trigger

User runs `/release` command in Claude Code.

### Flow

1. **Environment check**
   - Verify `gh` CLI is available and authenticated
   - Verify git remote points to a GitHub repo

2. **Collect commits**
   - Get last tag: `git describe --tags --abbrev=0`
   - If no tag exists, prompt user to confirm initial version (default: current `package.json` version)
   - Collect commits: `git log <last-tag>..HEAD --format="%s"`

3. **AI semver analysis**
   - Parse commit messages following Conventional Commits
   - Rules:
     - `feat!` or `breaking` → major bump
     - `feat:` → minor bump
     - `fix:` → patch bump
     - `refactor/docs/style/test/chore` → no bump (unless mixed with feat/fix)
   - If multiple types present, pick the highest bump
   - AI generates a summary of changes grouped by type

4. **User confirms version**
   - Display: suggested version bump, change summary
   - Example: `1.0.0 → 1.1.0 (+2 feat, +3 fix, +1 refactor)`
   - User can accept, override with different version, or cancel

5. **Update version numbers**
   - Update `version` in `package.json`
   - Update `version` in `manifest.json`
   - Two files must stay in sync

6. **Generate Release Notes**
   - AI generates bilingual (English + Chinese) release notes
   - Format:
     ```markdown
     ## TabFlow v{version}

     ### 🚀 New Features | 新功能
     - English description (中文描述)

     ### 🐛 Bug Fixes | Bug 修复
     - English description (中文描述)

     ### 🔧 Other Changes | 其他变更
     - English description (中文描述)
     ```
   - Rules:
     - Headings in English with Chinese translation
     - Group by type: Features → Bug Fixes → Other
     - Exclude pure technical changes (chore/refactor) unless user-facing
   - User reviews and can edit before proceeding

7. **Commit, tag, push**
   - `git commit -m "chore: release v{version}"`
   - `git tag -a v{version} -m "{release-notes}"`
   - `git push && git push --tags`

8. **Post-push**
   - Wait for GitHub Actions workflow to complete
   - Output the GitHub Release URL

### User Interaction Points

- Confirm or override suggested version number
- Review and edit Release Notes
- Confirm push (standard git safety)

## 2. GitHub Actions Workflow (Cloud)

### Trigger

```yaml
on:
  push:
    tags:
      - 'v*'
```

### Workflow Steps

1. **Checkout** — `actions/checkout@v4` with ref from tag
2. **Setup Node** — `actions/setup-node@v4` with node-version 18
3. **Install deps** — `npm ci`
4. **Build** — `npm run build`
5. **Extract version** — from tag: `${GITHUB_REF_NAME#v}`
6. **Package zip** — `cd dist && zip -r ../tabflow-v${version}.zip .`
7. **Extract Release Notes** — from annotated tag body into a temp file
8. **Create Release** — `gh release create` with zip and notes

### Environment

- Runner: `ubuntu-latest`
- Auth: `GITHUB_TOKEN` (auto-provided, no extra secrets needed)
- Single job, no matrix

### Artifacts

Each release contains:
- `tabflow-v{version}.zip` — ready-to-install extension package

## 3. File Changes

| File | Action | Description |
|------|--------|-------------|
| `.github/workflows/release.yml` | Create | GitHub Actions release workflow |
| `.claude/skills/release.md` | Create | `/release` skill definition for Claude Code |

## 4. Prerequisites

- Install `gh` CLI: `brew install gh`
- Authenticate: `gh auth login`
- Ensure repo is pushed to GitHub

## 5. Error Handling

| Scenario | Handling |
|----------|----------|
| `gh` not installed | Skill detects and prompts user to install |
| No git remote | Skill reports error, asks user to push to GitHub first |
| No commits since last tag | Skill reports "no new changes" and exits |
| GitHub Actions build fails | User gets email notification; fix and re-tag |
| Version already tagged | Skill detects conflict and suggests alternative version |
