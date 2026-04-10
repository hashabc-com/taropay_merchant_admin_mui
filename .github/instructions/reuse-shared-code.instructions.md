---
description: 'Use when creating new features, migrating modules, building forms, adding dialogs, or implementing list pages. Ensures reuse of existing shared components, hooks, and utilities instead of re-implementing equivalent logic.'
applyTo: 'src/sections/**'
---

# Reuse Shared Code — Do Not Re-Invent

When implementing any new feature, **always search the codebase for existing shared components, hooks, and utilities before writing new code**. If equivalent functionality exists, use it. If it's close but not exact, extend it rather than duplicating.

## Discovery Workflow

Before writing new UI patterns, data-fetching logic, or utility functions:

1. Check `src/components/` for shared UI components
2. Check `src/hooks/` for existing custom hooks
3. Check `src/utils/` and `src/lib/` for utility functions
4. Search existing `src/sections/` modules for similar patterns to follow

## Key Shared Assets (Must-Know)

### Dialogs & Interactions

| Need                  | Use                                                                 | NOT                            |
| --------------------- | ------------------------------------------------------------------- | ------------------------------ |
| Google 验证码二次确认 | `useGoogleAuthDialog()` from `src/components/google-auth-dialog/`   | 手动在表单中加 googleCode 字段 |
| 日期范围选择          | `DateTimeRangePicker` from `src/components/date-time-range-picker/` | 自建日期区间选择器             |

### Data Fetching & Search

| Need               | Use                                                                     | NOT                                 |
| ------------------ | ----------------------------------------------------------------------- | ----------------------------------- |
| 列表页搜索状态管理 | `useListSearch(FIELD_KEYS)` from `src/hooks/use-list-search.ts`         | 手写 `useSearchParams` + `useState` |
| 读取 URL 搜索参数  | `useSearchParamsObject(FIELD_KEYS)` from `src/hooks/use-list-search.ts` | 手动 `searchParams.get()` 逐个读取  |
| SWR 缓存键生成     | `useListSWRKey()` from `src/hooks/use-list-swr-key.ts`                  | 手动拼接字符串 key                  |
| 金额汇率转换       | `useConvertAmount()` from `src/hooks/use-convert-amount.ts`             | 手动计算汇率                        |

### UI Components

| Need                      | Use                                                                      | NOT                                 |
| ------------------------- | ------------------------------------------------------------------------ | ----------------------------------- |
| DataGrid 文本溢出 Tooltip | `renderCellWithTooltip` from `src/components/data-grid/`                 | MUI `Tooltip` 包裹单元格            |
| 表单控件                  | `Field`, `RHFTextField`, `RHFSelect` 等 from `src/components/hook-form/` | 原生 MUI 输入控件 + 手动 Controller |
| Zod 常用校验规则          | `schemaUtils` from `src/components/hook-form/schema-utils`               | 重复写正则或校验逻辑                |
| 图标                      | `Iconify` from `src/components/iconify/`                                 | 直接 import `@iconify/react`        |
| 状态标签                  | `Label` from `src/components/label/`                                     | 裸写 `Chip`                         |

### Core Patterns

| Need       | Use                                                  | NOT                       |
| ---------- | ---------------------------------------------------- | ------------------------- |
| HTTP 请求  | `http.get/post` from `src/lib/http.ts`               | 直接用 `axios`            |
| 国际化文案 | `t()` from `useLanguage()`                           | 硬编码中英文字符串        |
| Toast 提示 | `toast.success/error` from `sonner`                  | `alert()` 或 MUI Snackbar |
| 时间格式化 | `fDate`, `fDateTime` from `src/utils/format-time.ts` | 手动 `dayjs().format()`   |

## Rules

- **搜索优先**：对任何"看起来通用"的功能（弹窗、校验、格式化、数据获取模式），先在 `src/components/`、`src/hooks/`、`src/utils/` 中搜索是否已存在
- **参考现有模块**：新建 section 时，先看同项目中相似模块的实现方式，保持一致
- **不确定就问**：如果不确定某个功能是否有现成实现，优先搜索代码库而非假设没有
