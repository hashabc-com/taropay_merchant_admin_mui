import type { Theme } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';
import type { GridColDef, GridValidRowModel, GridRenderCellParams } from '@mui/x-data-grid';

import { renderCellWithTooltip } from './render-cell-with-tooltip';

// ----------------------------------------------------------------------

/**
 * 扩展 GridColDef，支持 `tooltip` 快捷配置。
 *
 * - `tooltip: true` → 自动为列添加溢出省略号 + hover Tooltip
 * - `tooltip: (params) => value` → 自定义取值 + 溢出省略号 + hover Tooltip
 */
export type TooltipColDef<R extends GridValidRowModel = any> = GridColDef<R> & {
  tooltip?: boolean | ((params: GridRenderCellParams<R>) => unknown);
};

/**
 * 列预处理器：
 * 1. 默认 `align: 'center'`、`headerAlign: 'center'`（可在单列上覆盖）
 * 2. 根据 `tooltip` 配置自动包装 `renderCell`
 *
 * ## 用法
 *
 * ```ts
 * const columns = processColumns<Order>([
 *   { field: 'name', tooltip: true },                                  // 居中 + tooltip
 *   { field: 'mobile', align: 'left', tooltip: true },                 // 左对齐 + tooltip
 *   { field: 'remark', align: 'left', tooltip: (p) => p.row.remark },  // 左对齐 + 自定义取值
 *   { field: 'amount' },                                               // 居中，无 tooltip
 *   { field: 'status', renderCell: ({ value }) => <Chip ... /> },      // 自定义渲染
 * ]);
 * ```
 */
export function processColumns<R extends GridValidRowModel>(
  columns: TooltipColDef<R>[]
): GridColDef<R>[] {
  return columns.map(({ tooltip, ...col }) => {
    const align = col.align ?? 'center';

    const result: GridColDef<R> = {
      ...col,
      align,
      headerAlign: col.headerAlign ?? align,
    };

    if (tooltip === true) {
      result.renderCell = renderCellWithTooltip;
    } else if (typeof tooltip === 'function') {
      result.renderCell = renderCellWithTooltip(
        tooltip as (params: GridRenderCellParams) => unknown
      );
    }

    return result;
  });
}

// ----------------------------------------------------------------------

/**
 * DataGrid 通用 sx 样式：
 * - 单元格 flex 垂直居中
 * - 根据列 `align` 自动设置水平对齐（配合 `processColumns` 默认 center）
 * - 表头背景色
 * - 去除焦点轮廓
 *
 * ## 用法
 *
 * ```tsx
 * <DataGrid columns={columns} sx={dataGridSx} />
 *
 * // 需要追加自定义样式时：
 * <DataGrid columns={columns} sx={[dataGridSx, { '& .MuiDataGrid-cell': { py: 1 } }]} />
 * ```
 */
export const dataGridSx: SystemStyleObject<Theme> = {
  // 覆盖 DataGrid 默认行高 52 → 56
  '& .MuiDataGrid-row': {
    '--height': '56px',
    minHeight: '56px !important',
    maxHeight: 'none !important',
  },
  // 单元格：flex 布局 + 垂直居中 + 最小行高
  '& .MuiDataGrid-cell': {
    display: 'flex',
    alignItems: 'center',
    minHeight: 56,
  },
  // 水平对齐：映射 MUI 的 align class → flex justify-content
  '& .MuiDataGrid-cell--textCenter': {
    justifyContent: 'center',
  },
  '& .MuiDataGrid-cell--textRight': {
    justifyContent: 'flex-end',
  },
  // 表头对齐：配合 headerAlign
  '& .MuiDataGrid-columnHeader--alignCenter .MuiDataGrid-columnHeaderTitleContainer': {
    justifyContent: 'center',
  },
  '& .MuiDataGrid-columnHeader--alignRight .MuiDataGrid-columnHeaderTitleContainer': {
    justifyContent: 'flex-end',
  },
  // 去除焦点轮廓
  '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
    outline: 'none',
  },
  '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
    outline: 'none',
  },
};
