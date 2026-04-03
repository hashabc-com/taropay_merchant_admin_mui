---
applyTo: 'taropay_merchant_admin_mui/**'
---

# TaroPay Admin MUI — Copilot Instructions

## Architecture Overview

Vite + React 19 + TypeScript admin dashboard built on **Minimal UI Kit v7.6.1**. Key stack: **MUI v7**, **React Router v7**, **SWR + Axios**, **Zustand**, **React Hook Form + Zod 4**, **Sonner** for toasts.

Package manager: **Yarn 1.22**. Use `yarn dev` / `yarn build`.

## Project Structure (Three-Layer Pattern)

```
pages/        → Thin page shells (metadata + render section view)
sections/     → Business views (UI, DataGrid, search, actions)
  └── module/
      ├── index.ts         → Re-exports
      ├── hooks.ts         → SWR data-fetching hooks + FIELD_KEYS
      ├── *-view.tsx       → Main view component
      └── *-search.tsx     → Search/filter component (使用 useListSearch)
api/          → API functions organized by domain (order.ts, login.ts, common.ts)
stores/       → Zustand global stores (auth, country, merchant)
lib/          → Core utilities (http.ts, i18n.ts, swr-config.ts, cookies.ts)
components/   → Shared UI (hook-form/, country-merchant-selector/, etc.)
```

## API & Data Fetching

- **HTTP client** (`src/lib/http.ts`): Custom `HttpClient` singleton wrapping Axios. Request interceptor auto-injects `Token` header, `country`, and `merchantId` from Zustand persist storage. Response interceptor handles `401` (redirect to login), `201` (error toast), `403` (refresh).
- **API functions** in `src/api/` call `http.get/post` directly — no hooks in this layer.
- **SWR hooks** live in each section's `hooks.ts`. Pattern:

  ```typescript
  export const FIELD_KEYS = ['channel', 'status', 'startTime', 'endTime'] as const;

  export function useXxxList() {
    const params = useSearchParamsObject(FIELD_KEYS) as XxxParams;

    const key = useListSWRKey('domain', 'action', params);

    const { data, isLoading, mutate } = useSWR(key, () => apiFn(params), {
      revalidateOnFocus: false,
      keepPreviousData: true,
    });
  }
  ```

- **SWR key 统一使用 `useListSWRKey`**（`src/hooks/use-list-swr-key.ts`）：该 hook 内部读取 `selectedCountry.code` 和 `selectedMerchant?.appid` 并追加到 key 末尾，当 `selectedCountry` 为空时返回 `null`（跳过请求）。不要在业务 hooks 中手动导入 country-store / merchant-store 来构建 SWR key。
- **国家切换重置 URL 参数但不导致双重请求**：`CountryMerchantSelector` 切换国家时，先**同步**执行 Zustand 更新 + `setSearchParams` 重置 URL（React 18 自动批处理为单次渲染），再异步拉取汇率。关键：所有同步状态更新必须在 `await` **之前**完成，否则 `await` 之后的更新脱离事件处理上下文，React 无法批处理，导致多次渲染和多次请求。
  - **必须用 `startTransition` 包裹**：React Router v7 的 `setSearchParams` 内部使用 `startTransition`（低优先级），而 Zustand 的 `useSyncExternalStore` 走同步优先级。优先级不同导致 React 分两次渲染 → 两次请求。用 `startTransition` 包裹所有 Zustand + URL 更新，统一到同一优先级 → 单次渲染 → 单次请求。
- `FIELD_KEYS` 必须在 `hooks.ts` 中导出，供 search 组件的 `useListSearch(FIELD_KEYS)` 和 SWR hook 的 `useSearchParamsObject(FIELD_KEYS)` 共用。

## State Management

| Store            | Persistence                                                   | Purpose                                                        |
| ---------------- | ------------------------------------------------------------- | -------------------------------------------------------------- |
| `auth-store`     | Manual `localStorage` (`_token`, `_userInfo`, `_permissions`) | Auth token, user info, permission checks via `hasPermission()` |
| `country-store`  | `zustand/persist` key `country-storage`                       | Selected country, display currency, exchange rates             |
| `merchant-store` | `zustand/persist` key `merchant-storage`                      | Selected merchant                                              |

- **URL search params** drive pagination and filters on all list pages (`useSearchParams`).
- HTTP interceptor reads directly from persist storage keys to avoid circular dependencies with React.

## Authentication

Dual-layer: **Zustand `auth-store`** is the source of truth; **AuthContext** (from Minimal template) bridges it for `AuthGuard`/`GuestGuard`.

Login flow: captcha → `loginApi({type:'login'})` → Google Auth check (bind or confirm) → `loginApi({type:'confirm'})` → store token + fetch permissions.

Logout: clear `localStorage` keys + clear Zustand stores + redirect with `returnTo`.

## Forms

Use **React Hook Form + Zod** with project-specific wrappers in `src/components/hook-form/`:

- `Form` (FormProvider wrapper), `Field` (unified entry), `RHFTextField`, `RHFSelect`, `RHFDatePicker`, `RHFAutocomplete`
- `schemaUtils` provides reusable Zod validators (date, email, phone, etc.)

## Routing

React Router v7 with `createBrowserRouter` in `src/main.tsx`. All paths centralized in `src/routes/paths.ts`. Dashboard routes use `lazy()` for code splitting. Route hooks: `usePathname`, `useRouter`, `useSearchParams` from `src/routes/hooks/`.

## Country/Merchant Context Pattern

Global header selector → Zustand stores → HTTP interceptor auto-injects → SWR keys include context → switching country/merchant auto-refetches all data. This is the core multi-tenant pattern of the app.

## i18n

Lightweight custom implementation (not i18next). `t('orders.receiveSummary.title')` via `useLanguage()` hook. Translations in `src/locales/{zh,en}.json`. Language stored in cookie.

## MUI Usage

- **MUI MCP 已配置**：遇到 MUI 组件用法不确定时，**必须先通过 MUI MCP 工具查询最新文档**，确保使用正确的 API 和最佳实践，避免使用已废弃的 props 或非惯用写法。
- **禁止硬编码样式值**：不得在代码中直接写死数值样式，如 `fontSize: 12`、`color: '#333'`、`padding: '8px 16px'` 等。应优先使用 MUI Theme tokens（`theme.spacing()`、`theme.typography.body2`、`theme.palette.text.secondary`）或 MUI `sx` prop 中的语义化 token（如 `fontSize: 'body2.fontSize'`、`color: 'text.secondary'`、`gap: 1`）。示例：
  ```typescript
  // ❌ 禁止
  sx={{ fontSize: 12, color: '#666', padding: '8px 16px' }}
  // ✅ 正确
  sx={{ fontSize: 'body2.fontSize', color: 'text.secondary', p: 2 }}
  ```
- **DataGrid 列宽统一使用 `flex: 1` 自适应**：所有列默认使用 `flex: 1`，不要设固定 `width`。需要限制最小宽度时用 `minWidth`。示例：
  ```typescript
  const columns: GridColDef[] = [
    { field: 'date', headerName: '日期', flex: 1, minWidth: 150 },
    { field: 'channel', headerName: '渠道', flex: 1, minWidth: 200 },
    { field: 'amount', headerName: '金额', flex: 1, minWidth: 120 },
  ];
  ```
- **DataGrid 文本溢出 Tooltip**：纯文本列需要溢出省略号 + hover 显示完整内容时，使用 `renderCellWithTooltip`（`src/components/data-grid/render-cell-with-tooltip.tsx`）。该函数仅在文本确实被截断时才弹出轻量 Popper 浮层，无动画、无跳动。用法：

  ```typescript
  import { renderCellWithTooltip } from 'src/components/data-grid';

  const columns: GridColDef[] = [
    { field: 'name', headerName: '名称', width: 120, renderCell: renderCellWithTooltip },
    {
      field: 'remark',
      headerName: '备注',
      flex: 1,
      minWidth: 150,
      renderCell: renderCellWithTooltip,
    },
  ];
  ```

  **注意**：不要自行用 MUI `Tooltip` 包裹 DataGrid 单元格文本（会导致高度跳动和 arrow 残留），统一使用此工具函数。

## Naming Conventions

- **组件命名必须语义化**，以功能/用途命名而非泛化名称。文件名使用 kebab-case，示例：
  - 搜索筛选区域 → `xxx-search.tsx`（**禁止使用 `toolbar` 命名**）
  - 订单详情抽屉 → `order-detail-drawer.tsx`
  - 行操作菜单 → `order-row-actions.tsx`
  - 视图组件 → `receive-summary-view.tsx`
- **搜索组件命名规范**：搜索/筛选组件统一命名为 `*-search.tsx`，组件名为 `XxxSearch`。不要用 `*-toolbar.tsx` / `XxxToolbar`。
- **避免**使用 `Component1.tsx`、`Section.tsx`、`Content.tsx` 等无意义命名。

## Conventions

- **表单提交按钮必须带 loading 状态**：所有异步提交操作的按钮必须在请求期间显示加载指示器，防止重复提交。用 `try/finally` 确保 loading 状态正确重置。禁止使用普通 `Button` 作为异步提交按钮。**loading 时必须同时显示 spinner 和文字**：使用 `startIcon` 条件渲染 `CircularProgress`，同时将按钮文字切换为进行中状态（如 `t('common.submitting')`），并设置 `disabled`。示例：
  ```typescript
  <Button
    variant="contained"
    onClick={handleSubmit}
    disabled={!isValid || loading}
    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
  >
    {loading ? t('common.submitting') : t('common.confirm')}
  </Button>
  ```
- **新增文案必须国际化**：所有用户可见的文本必须通过 `t()` 函数引用 i18n key，禁止硬编码中文或英文字符串。新增文案时必须同步更新 `src/locales/zh.json` 和 `src/locales/en.json` 两个文件。
- **Toasts**: Always use `sonner` — `toast.success()` / `toast.error()`. Never `alert()` or MUI Snackbar directly.
- **Icons**: Use `@iconify/react` via `src/components/iconify/`.
- **Date handling**: `dayjs` with formatters in `src/utils/format-time.ts`.
- **Amount conversion**: `useConvertAmount` hook applies exchange rates based on `displayCurrency` from country store.
- **Env vars**: Prefixed with `VITE_`. Dev uses Vite proxy (`/admin` → test server); test/prod use direct `VITE_TRAOPAY_API_URL`.
- **Response type**: All API responses follow `{ code, message, data?, result? }` shape (`ResponseData<T>`).
- **Section modules**: Follow the fixed structure: `index.ts` + `hooks.ts` + `*-view.tsx` + `*-search.tsx`。搜索组件必须使用公共 hook `useListSearch(FIELD_KEYS)`（`src/hooks/use-list-search.ts`），hooks 中使用 `useSearchParamsObject(FIELD_KEYS)` 读取 URL 参数，不要手写 `useSearchParams` + `useState` 管理搜索状态。

## MUI 组件注意事项

- **DialogContent `dividers` 会裁切第一行输入框浮动 label**：`DialogContent` 设置 `dividers` 后，顶部 border + 默认 `paddingTop` 较小，`outlined` TextField 的浮动 label 上移时会被 `overflow: auto` 裁剪。解决：给 `DialogContent` 添加 `sx={{ pt: 3 }}` 留出空间。示例：
  ```typescript
  // ❌ label 会被裁切
  <DialogContent dividers>
    <TextField ... />
  </DialogContent>
  // ✅ 正确
  <DialogContent dividers sx={{ pt: 3 }}>
    <TextField ... />
  </DialogContent>
  ```
- **Drawer 必须始终渲染，内容条件渲染**：需要 Drawer 滑入/滑出动画时，禁止在数据为空时 `return null` 跳过整个 `<Drawer>` 渲染，否则关闭时无滑出动画。正确做法：始终渲染 `<Drawer open={open}>`，仅在内部条件渲染内容。示例：
  ```typescript
  // ❌ 无关闭动画
  if (!data) return null;
  return <Drawer open={open}>...</Drawer>;
  // ✅ 正确
  return (
    <Drawer open={open} onClose={onClose}>
      {data && <Box>...</Box>}
    </Drawer>
  );
  ```
- **Card 背景色优先使用 `background.neutral`**：需要卡片区分背景时，使用 `bgcolor: 'background.neutral'`（Minimal UI 主题提供的中性色），不要使用 `primary.lighter` 等语义色作背景——在深色模式下对比度差、文字不可读。
