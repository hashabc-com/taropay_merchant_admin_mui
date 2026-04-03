import type { Theme, SxProps } from '@mui/material/styles';

import { varAlpha } from 'minimal-shared/utils';

// ----------------------------------------------------------------------

/**
 * 紧凑型 Select 样式 — 用于 header 工具栏选择器，去除默认边框和浮动 label。
 * 使用 `as const` 以便在消费侧安全 spread 嵌套键。
 */
export const compactSelectSx = {
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '& .MuiSelect-select': {
    py: 0.75,
    pl: 1.25,
    pr: '28px !important',
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    typography: 'body2',
    fontWeight: 600,
  },
  '& .MuiSelect-icon': { right: 4, color: 'text.disabled' },
} as const;

/**
 * Selector 分组容器样式
 */
export const selectorGroupSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  borderRadius: 1,
  border: {
    xs: 'none',
    sm: ((theme: Theme) =>
      `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`) as any,
  },
  transition: (theme: Theme) => theme.transitions.create('border-color'),
  '&:hover': {
    borderColor: (theme: Theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.32),
  },
};
