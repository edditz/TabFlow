# 用 AI 重新定义版本发布：从手动到一句话搞定

> 每次发版都要经历同样的折磨：查提交记录、算版本号、写 Release Notes、打包构建、上传产物……能不能让 AI 来搞定这一切？答案是：可以，而且比你做得更好。

## 传统发版的痛点

如果你维护过开源项目或团队产品，对这个流程一定不陌生：

1. 翻 git log，回顾这次迭代的变更
2. 根据 semver 规范纠结该升 major、minor 还是 patch
3. 更新 `package.json`、`manifest.json` 等多个文件的版本号
4. 手写 Release Notes（还得翻译成英文？中文？）
5. 打 tag、push、等 CI 构建、检查发布结果

**每一步都不难，但每一步都容易出错。** 版本号忘更新一个文件、Release Notes 遗漏了重要变更、tag 名拼错……这些"低级错误"在手动流程中反复出现。

核心矛盾在于：**发版是一个高度结构化的决策过程，但人类大脑不擅长处理结构化重复任务。** 这恰恰是 AI 最擅长的领域。

## 核心思想：AI 做决策，CI 做执行

我们设计的方案遵循一个简单的分工原则：

```
┌─────────────────────────────┐     ┌─────────────────────────────┐
│         AI (本地)            │     │       CI/CD (云端)           │
│                             │     │                             │
│  ✦ 分析提交，判断版本号      │     │  ✦ 拉取代码                 │
│  ✦ 生成 Release Notes       │     │  ✦ 安装依赖、构建           │
│  ✦ 创建 tag                 │     │  ✦ 打包产物                 │
│  ✦ 人确认后 push             │     │  ✦ 创建 GitHub Release      │
│                             │     │                             │
│  负责：理解、决策、沟通       │     │  负责：执行、验证、交付       │
└─────────────────────────────┘     └─────────────────────────────┘
```

**为什么这样分工？**

- AI 擅长理解自然语言（commit message），能做语义分析、分类归纳、多语言翻译
- CI/CD 擅长确定性执行，环境一致、可重复、可审计
- 两者通过 **git tag** 这个简单的协议通信——AI 把 Release Notes 写进 annotated tag，CI 读取 tag 内容创建正式发布

这种"本地 AI + 云端 CI"的混合架构，既保留了开发者的控制感，又实现了高度的自动化。

## 实现思路

### 第一步：建立约定

自动化的前提是规范。我们采用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
feat: add dark mode support
fix: resolve memory leak in content script
docs: update API documentation
refactor: extract tab filtering logic
```

每个 commit message 都是一个结构化信号。AI 要做的，就是**解读这些信号**。

### 第二步：让 AI 读懂变更意图

当开发者触发发版流程时，AI 做的第一件事是**收集和解读变更**：

```
git log v1.0.0..HEAD --format="%s"
```

拿到一堆 commit message 后，AI 执行两个关键判断：

**判断 1：版本号应该怎么升？**

| 提交模式 | 版本变化 | 逻辑 |
|---------|---------|------|
| `feat!:` 或 `BREAKING CHANGE` | major (x.0.0) | 有破坏性变更 |
| `feat:` | minor (0.x.0) | 有新功能 |
| `fix:` | patch (0.0.x) | 只有修复 |
| 仅 `chore/docs/refactor` | 不升版 | 无用户可感知变更 |

多条规则命中时，取**最高级别**。比如同时有 `feat` 和 `fix`，就升 minor。

这个规则简单到可以硬编码，但 AI 的价值在于**理解上下文**。比如 `refactor: completely rewrite the auth system` 虽然前缀是 refactor，但 AI 能判断这实际上是破坏性变更，会提醒开发者。

**判断 2：这些变更怎么向用户描述？**

AI 把技术性的 commit message 翻译成用户能理解的 Release Notes：

```
技术语言:  feat: add i18n support for zh-CN
用户语言:  Added Chinese language support (新增中文语言支持)
```

这就是 AI 真正的不可替代之处——**把工程师的黑话翻译成人话**，而且可以同时生成多语言版本。

### 第三步：人机协作的确认环节

完全自动化的发版是危险的。我们设计了两道人工确认：

1. **版本号确认**：AI 给出建议，开发者可以接受、修改或取消
2. **Release Notes 审核**：AI 生成草稿，开发者可以补充或删改

```bash
# AI 展示分析结果
Version Analysis
────────────────
Base version: 1.0.0
Suggested bump: minor
New version: 1.1.0

Changes:
  feat:  3 commits
  fix:   2 commits
  other: 5 commits

Accept this version? (Enter to confirm, or type a different version)
```

**人做最终决策，AI 负责准备选项和材料。** 这比全自动更安全，比全手动更高效。

### 第四步：用 tag 作为通信协议

AI 把 Release Notes 写入 annotated git tag：

```bash
git tag -a "v1.1.0" -F release-notes.txt
```

这个设计很优雅：
- tag 本身就是版本号的天然载体
- annotated tag 可以携带任意长度的文本（Release Notes）
- push tag 时自然触发 CI，不需要额外 API 调用
- tag 是不可变的，发布记录天然可审计

### 第五步：CI 完成剩余工作

GitHub Actions 监听 `v*` tag 的 push 事件，执行确定性流程：

```yaml
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    steps:
      - checkout → npm ci → npm run build → package zip → create release
```

CI 从 tag 中提取版本号和 Release Notes，完成构建并创建正式的 GitHub Release。整个过程不依赖任何人工操作。

## 完整示例：从零搭建 AI 发版流程

下面用一个真实的浏览器扩展项目（TabFlow）来演示完整方案。项目当前版本 `v1.0.0`，使用 Conventional Commits 规范提交代码。

### 背景：这次要发布什么？

最近一个迭代产生了这些提交：

```
feat: add smart tab classification with AI
feat: support drag-and-drop reordering in classification
fix: resolve panel flickering on fast toggles
fix: fix theme not applying to classification panel
refactor: extract classification logic into separate module
docs: add smart classification feature documentation
```

开发者只需要做一件事——输入 `/release`，AI 接管剩余流程。

---

### Part 1：AI Skill — 让 AI "学会"发版

关键设计决策：**不发版逻辑硬编码成脚本，而是写成一份"指令手册"交给 AI 执行。**

为什么？因为发版过程充满需要"理解力"的环节——判断版本号需要理解语义，写 Release Notes 需要理解变更对用户的影响。这些不是 `if-else` 能搞定的。

这份指令手册就是 AI Skill 文件。在我们的项目中，它长这样：

```markdown
# .claude/skills/release/SKILL.md

---
name: release
description: Analyze commits since last release, determine semver bump,
             generate release notes, create tag, and trigger GitHub Actions build
user-invocable: true
---

# Release Skill

When the user invokes `/release`, execute the following workflow step by step.
Stop and ask for confirmation at each user interaction point.

## Step 1: Environment Check

Run these checks in order. If any fails, tell the user what to fix and STOP.

    # Check gh CLI
    which gh || { echo "ERROR: gh CLI not installed"; exit 1; }
    # Check gh authentication
    gh auth status || { echo "ERROR: gh not authenticated"; exit 1; }
    # Check git remote
    git remote get-url origin || { echo "ERROR: No git remote"; exit 1; }

## Step 2: Collect Commits

    LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

If `LAST_TAG` is empty → initial release, collect ALL commits.
If `LAST_TAG` is set → collect: `git log ${LAST_TAG}..HEAD --format="%s"`

Show the user the collected commit list.

## Step 3: AI Semver Analysis

| Pattern                          | Bump          |
|----------------------------------|---------------|
| `feat!:` or `BREAKING CHANGE`   | major (x.0.0) |
| `feat:`                          | minor (0.x.0) |
| `fix:`                           | patch (0.0.x) |
| only `chore/docs/refactor/...`   | no bump       |

If multiple bump levels apply, use the **highest**.
Present analysis to user, ask for confirmation.

## Step 4: Update Version Files

Update version in TWO files — they MUST stay in sync:
1. `package.json` — the `"version"` field
2. `manifest.json` — the `"version"` field

## Step 5: Generate Release Notes

Group commits by type. Each bullet: English first, Chinese in parentheses.
Omit empty sections. User reviews before proceeding.

## Step 6: Commit, Tag, Push

    git add package.json manifest.json
    git commit -m "chore: release v{version}"
    git tag -a "v{version}" -F /tmp/release-notes.txt

STOP before push and ask for final confirmation.

## Step 7: Post-Push

Inform user that GitHub Actions workflow is triggered.
Provide the GitHub Actions run URL.
```

**解读这份 Skill 的设计要点：**

**1. 渐进式确认（Step 2 → 3 → 5 → 6）**

Skill 不是一口气跑完，而是每到一个关键节点就停下来等用户确认。四个交互点：看 commit 列表、确认版本号、审核 Release Notes、确认推送。这保证人在回路中始终拥有否决权。

**2. 版本号判断规则（Step 3）**

规则本身可以用代码实现，但交给 AI 有一个额外的好处：**AI 能识别规则之外的边界情况。** 比如 `refactor: completely rewrite the authentication flow` 虽然前缀是 refactor，但 AI 能提醒开发者这可能应该作为 breaking change 处理。

**3. 多文件同步（Step 4）**

浏览器扩展的版本号存在于 `package.json` 和 `manifest.json` 两个文件中。Skill 明确要求"必须同步"，AI 会逐一更新并验证。这种跨文件的协调工作，AI 比手动操作可靠得多。

**4. Release Notes 生成（Step 5）**

这里体现了 AI 的核心价值：**把技术语言翻译成用户语言，同时支持多语种。** 规则只规定了格式和分组逻辑，具体怎么措辞由 AI 根据上下文自主决定。

**5. Tag 作为通信桥梁（Step 6）**

注意 `git tag -a` 命令使用了 `-F` 参数从文件读取——这避免了 shell 转义问题，也意味着 Release Notes 可以是任意长度的 Markdown 文本。这个 tag 就是 AI 和 CI 之间的"信封"。

---

回到我们的示例，开发者输入 `/release` 后，AI 按 Skill 指令逐步执行：

**Step 2 — AI 收集并展示提交记录：**

```
Last release: v1.0.0

Commits since v1.0.0:
  feat: add smart tab classification with AI
  feat: support drag-and-drop reordering in classification
  fix: resolve panel flickering on fast toggles
  fix: fix theme not applying to classification panel
  refactor: extract classification logic into separate module
  docs: add smart classification feature documentation
```

**Step 3 — AI 分析版本号：**

```
Version Analysis
────────────────
Base version: 1.0.0
Suggested bump: minor     ← 因为有 feat 提交，取最高级别
New version: 1.1.0

Changes:
  feat:  2 commits
  fix:   2 commits
  other: 2 commits

Accept this version? (Enter to confirm, or type a different version)
```

**Step 5 — AI 生成 Release Notes：**

```markdown
## TabFlow v1.1.0

### 🚀 New Features | 新功能
- AI-powered smart tab classification (AI 智能标签分类)
- Drag-and-drop reordering for tab groups (标签组拖拽排序)

### 🐛 Bug Fixes | Bug 修复
- Fixed panel flickering on rapid toggles (修复快速切换面板闪烁问题)
- Fixed theme not applying to classification panel (修复分类面板主题不生效问题)
```

注意 `refactor` 和 `docs` 类型的提交没有出现在 Notes 中——Skill 规则要求"排除纯技术变更，除非面向用户"。AI 正确应用了这条规则。

**Step 6 — 开发者确认后，AI 执行 git 操作：**

```bash
git add package.json manifest.json
git commit -m "chore: release v1.1.0"
git tag -a "v1.1.0" -F /tmp/release-notes.txt   # Release Notes 写入 tag
git push && git push --tags                        # 推送触发 CI
```

至此，本地 AI 的工作完成。接下来轮到云端 CI 接手。

---

### Part 2：CI 配置 — 确定性执行机器

AI 负责"思考和沟通"，CI 负责"动手干活"。CI 的核心要求是**确定性**——同样的输入永远产生同样的输出。

```yaml
# .github/workflows/release.yml

name: Release

on:
  push:
    tags:
      - 'v*'          # 监听所有 v 开头的 tag

permissions:
  contents: write     # 需要写权限来创建 Release

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

      - name: Verify build output
        run: |
          if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
            echo "::error::Build output is empty"
            exit 1
          fi

      - name: Package zip
        run: |
          VERSION="${GITHUB_REF_NAME#v}"    # v1.1.0 → 1.1.0
          cd dist
          zip -r "../tabflow-v${VERSION}.zip" .

      - name: Extract release notes from tag
        run: |
          NOTES=$(git for-each-ref "refs/tags/${GITHUB_REF_NAME}" \
                  --format='%(contents)')
          if [ -z "$NOTES" ]; then
            echo "No release notes provided" > release-notes.md
          else
            echo "$NOTES" | sed '/^$/d' > release-notes.md
          fi

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

**逐段解读 CI 的设计：**

**1. 触发条件：tag 即信号**

```yaml
on:
  push:
    tags:
      - 'v*'
```

只有推送 `v` 开头的 tag 才触发。日常的代码推送、PR 合并都不会误触发。这个简单的模式匹配就是 AI 和 CI 之间的"握手协议"——AI 创建 tag，CI 响应 tag。

**2. 构建验证：防线不能少**

```yaml
- name: Verify build output
  run: |
    if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
      echo "::error::Build output is empty"
      exit 1
    fi
```

这一步看似简单，实则关键。构建可能"成功"但产物为空（比如配置错误导致输出到错误目录）。CI 在这里充当**质量守门员**——即使是 AI 触发的发布，也要验证产物完整。

**3. 从 tag 提取信息：拆信封**

```yaml
- name: Extract release notes from tag
  run: |
    NOTES=$(git for-each-ref "refs/tags/${GITHUB_REF_NAME}" \
            --format='%(contents)')
```

这里就是 CI 拆开 AI 写的"信封"的地方。`git for-each-ref` 读取 annotated tag 的内容，也就是 AI 在 Skill Step 5 中生成的 Release Notes。`GITHUB_REF_NAME` 就是 tag 名（如 `v1.1.0`），`${GITHUB_REF_NAME#v}` 去掉 `v` 前缀得到纯版本号。

**4. 创建发布：交付终点**

```yaml
gh release create "${GITHUB_REF_NAME}" \
  "tabflow-v${VERSION}.zip" \
  --title "TabFlow v${VERSION}" \
  --notes-file release-notes.md
```

最终的 `gh release create` 命令完成闭环——用 AI 生成的 Release Notes 和 CI 构建的 zip 产物，创建一个完整的 GitHub Release。用户可以立即下载安装。

**5. 零密钥设计**

```yaml
permissions:
  contents: write

env:
  GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

整个 CI 只用了 `GITHUB_TOKEN`——这是 GitHub Actions 自动提供的，不需要配置任何额外的 Secret。简洁意味着安全，少一个密钥就少一个泄露风险。

---

### 端到端流程回顾

把 Skill 和 CI 串起来，完整的数据流是这样的：

```
开发者输入 /release
       │
       ▼
┌──────────────────────────────────────────────┐
│            AI Skill (本地)                    │
│                                              │
│  git log → 收集 commits                      │
│       ↓                                      │
│  分析 commit 类型 → 判断 minor bump           │
│       ↓                                      │
│  等待用户确认版本号 ←── 人                     │
│       ↓                                      │
│  更新 package.json + manifest.json           │
│       ↓                                      │
│  生成双语 Release Notes                      │
│       ↓                                      │
│  等待用户审核 Notes  ←── 人                   │
│       ↓                                      │
│  git commit + git tag -a (Notes 写入 tag)    │
│       ↓                                      │
│  等待用户确认 push  ←── 人                    │
│       ↓                                      │
│  git push && git push --tags                 │
└──────────────────────────────────────────────┘
       │
       │  tag v1.1.0 推送到 GitHub
       ▼
┌──────────────────────────────────────────────┐
│         GitHub Actions (云端)                 │
│                                              │
│  触发：on push tags v*                        │
│       ↓                                      │
│  checkout → npm ci → npm run build           │
│       ↓                                      │
│  验证 dist/ 非空                              │
│       ↓                                      │
│  打包 tabflow-v1.1.0.zip                     │
│       ↓                                      │
│  从 tag 提取 Release Notes                   │
│       ↓                                      │
│  gh release create (上传 zip + Notes)         │
└──────────────────────────────────────────────┘
       │
       ▼
  GitHub Release 页面上线，用户可下载安装
```

**整个发版过程中，开发者的实际操作：** 输入 `/release` → 按回车确认版本号 → 按回车确认 Notes → 输入 `y` 确认推送。四步，不到一分钟。

## 设计原则回顾

总结一下这个方案背后的设计思想：

### 1. 把"理解"交给 AI，把"执行"交给机器

AI 不是用来替代 CI 的，而是用来做 CI 做不了的事——理解语义、做出判断、生成内容。同样，CI 也不是用来替代 AI 的——确定性构建、环境隔离、可审计执行，这些 AI 做不好。

### 2. 用简单协议连接复杂系统

AI 和 CI 之间通过 git tag 通信。没有数据库、没有 API、没有消息队列。就是一个 git tag。简单意味着可靠，可靠意味着你敢在周五下午用它发版。

### 3. 人在回路，但不是瓶颈

开发者审核版本号和 Release Notes，但不需要动手写任何东西。确认比创作快十倍。人是安全网，不是流水线工人。

### 4. 规范是自动化的基础

Conventional Commits 不是在给开发者增加约束，而是在给 AI 提供信号。规范越清晰，自动化越可靠。反过来，好的自动化也会激励开发者遵守规范——因为按规范写 commit，发版时就自动变成 Release Notes。

## 可操作性 Checklist

如果你想在自己的项目中实现类似方案，以下是核心步骤：

- [ ] **采用 Conventional Commits** — 这是自动化的基石
- [ ] **编写 AI Skill 文件** — 定义发版流程的每一步，让 AI 遵循执行
- [ ] **设计确认环节** — 在版本号和 Release Notes 处设置人工审核点
- [ ] **选择通信协议** — git tag、GitHub API、或你喜欢的任何方式
- [ ] **配置 CI 流水线** — 监听协议触发，执行构建和发布
- [ ] **验证端到端流程** — 先用 dry-run 测试，再正式使用

## 写在最后

AI 驱动的版本发布不是一个"炫技"的实验，而是一个**务实的工程实践**。它没有取代开发者的判断力，而是把开发者从重复劳动中解放出来，专注于真正需要人类智慧的决策。

当你下次面对一堆 commit 记录发愁时，不妨想想：这些工作是不是可以让 AI 来做初稿，然后你只需要说"OK"？

---

*本文基于 TabFlow 浏览器扩展项目的实际发版方案，完整源码可在 [GitHub](https://github.com) 上查看。*
