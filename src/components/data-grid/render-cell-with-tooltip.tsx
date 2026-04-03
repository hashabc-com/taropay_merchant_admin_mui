import type { GridRenderCellParams } from '@mui/x-data-grid';

import { useRef, useState, useCallback } from 'react';

import Popper from '@mui/material/Popper';
import { styled } from '@mui/material/styles';

// ----------------------------------------------------------------------

/**
 * 检测 DOM 元素是否存在文本溢出（ellipsis）
 */
function isOverflown(element: Element): boolean {
  return element.scrollWidth > element.clientWidth;
}

// ----------------------------------------------------------------------

/**
 * 通用的 DataGrid 单元格渲染：文本溢出时显示省略号 + hover 显示完整内容的 Tooltip。
 *
 * **仅当文本确实被截断时才弹出 Tooltip**，短文本不会弹出多余气泡。
 * 鼠标可移入浮层复制内容，移出后自动关闭。
 *
 * 对齐方式自动继承自列定义的 `align` 属性（配合 `processColumns` 使用），无需手动传入。
 *
 * ## 用法
 *
 * 1. **直接用于纯文本列**：
 * ```ts
 * { field: 'name', headerName: '名称', width: 120, renderCell: renderCellWithTooltip }
 * ```
 *
 * 2. **传入自定义取值函数**（处理好的文本）：
 * ```ts
 * {
 *   field: 'transId',
 *   renderCell: renderCellWithTooltip((params) =>
 *     params.row.transactionType === 'P' ? params.row.transId : params.row.transactionid
 *   ),
 * }
 * ```
 *
 * 3. **配合 `processColumns` 使用**（推荐）：
 * ```ts
 * const columns = processColumns([
 *   { field: 'name', tooltip: true },
 *   { field: 'remark', align: 'left', tooltip: (p) => p.row.remark },
 * ]);
 * ```
 */
// 重载签名：工厂模式 — 传入取值函数，返回 renderCell 函数
export function renderCellWithTooltip(
  getter: (params: GridRenderCellParams) => unknown
): (params: GridRenderCellParams) => React.ReactElement;
// 重载签名：直接模式 — 作为 renderCell 使用
export function renderCellWithTooltip(params: GridRenderCellParams): React.ReactElement;
// 实现
export function renderCellWithTooltip(
  paramsOrGetter: GridRenderCellParams | ((params: GridRenderCellParams) => unknown)
): React.ReactElement | ((params: GridRenderCellParams) => React.ReactElement) {
  // 工厂模式
  if (typeof paramsOrGetter === 'function') {
    return (params: GridRenderCellParams) => {
      const raw = paramsOrGetter(params);
      const text = raw == null || raw === '' ? '-' : String(raw);
      return <OverflowTooltipCell text={text} />;
    };
  }

  // 直接模式
  const value = paramsOrGetter.formattedValue ?? paramsOrGetter.value;
  const text = value == null || value === '' ? '-' : String(value);
  return <OverflowTooltipCell text={text} />;
}

// ----------------------------------------------------------------------

const TooltipPopup = styled('div')(({ theme }) => ({
  padding: '4px 8px',
  fontSize: theme.typography.caption.fontSize,
  fontWeight: theme.typography.fontWeightMedium,
  color: theme.palette.common.white,
  backgroundColor: theme.palette.grey[800],
  borderRadius: theme.shape.borderRadius,
  maxWidth: 400,
  wordBreak: 'break-word',
  userSelect: 'text',
  cursor: 'text',
  ...theme.applyStyles('dark', {
    backgroundColor: theme.palette.grey[200],
    color: theme.palette.grey[900],
  }),
}));

/**
 * 内部组件：检测溢出 → 用轻量 Popper 展示完整文本。
 * 鼠标可移入 Popper 浮层进行文本选择和复制，
 * 鼠标离开单元格 + 浮层后延迟关闭。
 */
function OverflowTooltipCell({ text }: { text: string }) {
  const cellRef = useRef<HTMLSpanElement>(null);
  const popperRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const [open, setOpen] = useState(false);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const handleCellEnter = useCallback(() => {
    cancelClose();
    if (cellRef.current && isOverflown(cellRef.current)) {
      setOpen(true);
    }
  }, [cancelClose]);

  const handleCellLeave = useCallback(() => {
    scheduleClose();
  }, [scheduleClose]);

  const handlePopperEnter = useCallback(() => {
    cancelClose();
  }, [cancelClose]);

  const handlePopperLeave = useCallback(() => {
    scheduleClose();
  }, [scheduleClose]);

  return (
    <>
      <span
        ref={cellRef}
        onMouseEnter={handleCellEnter}
        onMouseLeave={handleCellLeave}
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          display: 'block',
          textAlign: 'inherit',
        }}
      >
        {text}
      </span>

      {open && (
        <Popper
          open
          anchorEl={cellRef.current}
          placement="top"
          disablePortal={false}
          // modifiers={[{ name: 'offset', options: { offset: [0, 2] } }]}
          style={{ zIndex: 1500 }}
        >
          <TooltipPopup
            ref={popperRef}
            onMouseEnter={handlePopperEnter}
            onMouseLeave={handlePopperLeave}
          >
            {text}
          </TooltipPopup>
        </Popper>
      )}
    </>
  );
}
