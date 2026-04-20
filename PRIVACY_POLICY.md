# TabFlow Privacy Policy / TabFlow 隐私权政策

**Last updated / 最后更新：2026-04-20**

---

## English

### Overview

TabFlow is a browser extension that helps users manage and organize their tabs. We are committed to protecting your privacy.

### Data We Collect

TabFlow **does not collect, sell, or share any personal user data**.

### Data Stored Locally

The following data is stored exclusively on your device using `chrome.storage.sync`:

- Theme preference (Light / Dark / System)
- Language preference (English / Chinese)
- Search scope settings
- URL display style settings
- Custom keyboard shortcuts
- AI classification settings (API endpoint, model name)

This data syncs across your devices via your browser's built-in sync feature. We do not have access to this data.

### Data Transmitted Externally

TabFlow includes an **optional** AI-powered tab classification feature. When you choose to enable it:

- **What is sent**: Only tab titles and URLs are sent to the API endpoint **you configure yourself**.
- **What is NOT sent**: No page content, browsing history, personal information, or authentication data is transmitted.
- **Who receives it**: The data is sent to the API endpoint you specify. We do not operate or have access to that endpoint.
- **User control**: This feature is disabled by default. You can enable or disable it at any time in the extension settings.

### Permissions Explanation

| Permission | Purpose |
|------------|---------|
| `tabs` | Read tab titles and URLs for search and classification |
| `activeTab` | Identify the currently active tab |
| `tabGroups` | Create and manage Chrome tab groups |
| `storage` | Save user preferences locally |
| `sessions` | Retrieve recently closed tabs for restoration |
| `<all_urls>` | Inject the search panel on any webpage |

### Third-Party Services

TabFlow does not integrate with any third-party analytics, advertising, or tracking services. The only external communication is the user-configured AI API endpoint described above.

### Children's Privacy

TabFlow is not directed at children under 13. We do not knowingly collect data from children.

### Changes to This Policy

We may update this privacy policy from time to time. Changes will be reflected in the "Last updated" date above.

### Contact

If you have questions about this privacy policy, please open an issue on our GitHub repository.

---

## 中文

### 概述

TabFlow 是一款帮助用户管理和整理浏览器标签页的扩展。我们致力于保护您的隐私。

### 我们收集的数据

TabFlow **不收集、不出售、不共享任何个人用户数据**。

### 本地存储的数据

以下数据仅通过 `chrome.storage.sync` 存储在您的设备上：

- 主题偏好（浅色 / 深色 / 跟随系统）
- 语言偏好（英文 / 中文）
- 搜索范围设置
- 网址显示样式设置
- 自定义快捷键
- AI 分类设置（API 端点、模型名称）

此数据通过浏览器内置的同步功能在您的设备间同步，我们无法访问这些数据。

### 外部传输的数据

TabFlow 包含一项**可选的** AI 智能标签分类功能。当您选择启用该功能时：

- **发送内容**：仅发送标签页的标题和 URL 至**您自行配置的** API 端点。
- **不发送内容**：不发送任何页面内容、浏览历史、个人信息或认证数据。
- **接收方**：数据发送至您指定的 API 端点，我们不运营也无法访问该端点。
- **用户控制**：该功能默认关闭，您可以随时在扩展设置中启用或关闭。

### 权限说明

| 权限 | 用途 |
|------|------|
| `tabs` | 读取标签页标题和 URL，用于搜索和分类 |
| `activeTab` | 识别当前活动标签页 |
| `tabGroups` | 创建和管理 Chrome 标签组 |
| `storage` | 在本地保存用户偏好设置 |
| `sessions` | 获取最近关闭的标签页以便恢复 |
| `<all_urls>` | 在任意网页上注入搜索面板 |

### 第三方服务

TabFlow 不集成任何第三方分析、广告或跟踪服务。唯一的外部通信是上述用户自行配置的 AI API 端点。

### 儿童隐私

TabFlow 并非面向 13 岁以下儿童，我们不会故意收集儿童的数据。

### 政策变更

我们可能会不时更新本隐私权政策，变更将反映在上方的「最后更新」日期中。

### 联系方式

如果您对本隐私权政策有任何疑问，请在我们的 GitHub 仓库提交 Issue。
