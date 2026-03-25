# Lint 配置指南

## 触发命令

```bash
# 运行 ESLint 检查
npm run lint

# 运行 ESLint 并自动修复
npm run lint:fix

# 检查代码格式
npm run format:check

# 格式化代码
npm run format
```

## 配置文件

| 文件 | 说明 |
|------|------|
| `eslint.config.js` | ESLint 配置 (flat config) |
| `.prettierrc` | Prettier 格式化配置 |

## 使用的插件

| 插件 | 用途 |
|------|------|
| `typescript-eslint` | TypeScript 支持 |
| `eslint-plugin-react` | React 规则 |
| `eslint-plugin-react-hooks` | React Hooks 规则 |
| `prettier` | 代码格式化 |

## 忽略规则

未使用的变量可以使用 `_` 前缀忽略：

```typescript
// 正常会报错
catch (error) { }

// 使用 _ 前缀忽略
catch (_error) { }
```
