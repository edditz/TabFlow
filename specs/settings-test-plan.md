# Tab Tool 设置页面测试计划

## Application Overview

Tab Tool 设置页面测试 - 测试浏览器扩展的设置页面功能，包括主题切换、语言切换、开关设置和下拉选择等功能。由于是浏览器扩展，需要通过 chrome-extension:// 协议访问设置页面。

## Test Scenarios

### 1. 设置页面基本操作

**Seed:** `specs/seed.spec.ts`

#### 1.1. 页面加载和初始状态

**File:** `specs/settings/page-load.spec.ts`

**Steps:**
  1. 打开设置页面
    - expect: 页面标题显示 'Tab Tool Settings'
    - expect: 显示版本号信息
    - expect: 所有设置项都正确加载
  2. 检查默认设置值
    - expect: 启用搜索面板开关默认开启
    - expect: 主题选择器默认为 '跟随系统'
    - expect: 语言选择器默认为英文

#### 1.2. 主题切换功能

**File:** `specs/settings/theme-switch.spec.ts`

**Steps:**
  1. 切换主题为浅色模式
    - expect: 主题选择器显示 '浅色'
    - expect: 页面背景变为浅色
  2. 切换主题为深色模式
    - expect: 主题选择器显示 '深色'
    - expect: 页面背景变为深色
    - expect: 文字颜色相应变化
  3. 切换主题为跟随系统
    - expect: 主题选择器显示 '跟随系统'
    - expect: 主题根据系统设置自动切换

#### 1.3. 语言切换功能

**File:** `specs/settings/language-switch.spec.ts`

**Steps:**
  1. 切换语言为中文
    - expect: 语言选择器显示 '中文'
    - expect: 所有界面文字切换为中文
    - expect: 设置标题变为 'Tab Tool 设置'
  2. 切换语言为英文
    - expect: 语言选择器显示 'English'
    - expect: 所有界面文字切换为英文
    - expect: 设置标题变为 'Tab Tool Settings'

#### 1.4. 开关设置功能

**File:** `specs/settings/toggle-settings.spec.ts`

**Steps:**
  1. 关闭启用搜索面板开关
    - expect: 开关状态变为关闭
    - expect: 设置自动保存
    - expect: 显示保存成功提示
  2. 打开显示标签页数量开关
    - expect: 开关状态变为开启
    - expect: 设置自动保存
    - expect: 显示保存成功提示
  3. 关闭仅搜索当前窗口开关
    - expect: 开关状态变为关闭
    - expect: 设置自动保存

#### 1.5. 下拉选择功能

**File:** `specs/settings/select-settings.spec.ts`

**Steps:**
  1. 切换 URL 显示样式为 '仅域名'
    - expect: 下拉框显示 '仅域名'
    - expect: 设置自动保存
  2. 切换 URL 显示样式为 '完整 URL'
    - expect: 下拉框显示 '完整 URL'
    - expect: 设置自动保存
  3. 切换 URL 显示样式为 '不显示'
    - expect: 下拉框显示 '不显示'
    - expect: 设置自动保存

#### 1.6. 设置持久化

**File:** `specs/settings/persistence.spec.ts`

**Steps:**
  1. 修改多个设置项
    - expect: 所有修改都保存成功
  2. 刷新页面
    - expect: 所有设置项保持修改后的值
    - expect: 主题设置保持不变
    - expect: 语言设置保持不变
    - expect: 开关状态保持不变
