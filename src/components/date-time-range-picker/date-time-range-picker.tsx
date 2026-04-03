import type { Dayjs } from 'dayjs';
import type { Theme } from '@mui/material/styles';
import type { PickersDayProps } from '@mui/x-date-pickers/PickersDay';

import dayjs from 'dayjs';
import { varAlpha } from 'minimal-shared/utils';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

export type DateTimeRangeValue = [Dayjs | null, Dayjs | null];

type ActiveField = 'start' | 'end';

export interface QuickSelectOption {
  label: string;
  getValue: () => DateTimeRangeValue;
}

export interface DateTimeRangePickerProps {
  /** The selected range [start, end] */
  value: DateTimeRangeValue;
  /** Callback when the range changes (called on OK) */
  onChange: (value: DateTimeRangeValue) => void;
  /** Whether to show time picker (hour/minute/second), defaults to false */
  showTime?: boolean;
  /** Whether to show seconds column (only when showTime=true), defaults to true */
  showSeconds?: boolean;
  /** Display format for dates. Auto-derived from showTime/showSeconds if not provided */
  format?: string;
  /** Size of the trigger input */
  size?: 'small' | 'medium';
  /** Label for the trigger input */
  label?: string;
  /** Placeholder when no dates selected */
  placeholder?: string;
  /** Label for start date header */
  startLabel?: string;
  /** Label for end date header */
  endLabel?: string;
  /** Cancel button text */
  cancelText?: string;
  /** OK button text */
  confirmText?: string;
  /** Quick-select presets. Pass `false` to hide. Defaults to built-in presets. */
  quickSelects?: QuickSelectOption[] | false;
  /** sx props for the trigger root element */
  sx?: object;
}

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function generateRange(start: number, end: number, step = 1): number[] {
  const result: number[] = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
}

const HOURS = generateRange(0, 23);
const MINUTES = generateRange(0, 59);
const SECONDS = generateRange(0, 59);

function applyTime(date: Dayjs, existing: Dayjs | null): Dayjs {
  if (!existing) return date.startOf('day');
  return date.hour(existing.hour()).minute(existing.minute()).second(existing.second());
}

function getDefaultFormat(showTime?: boolean, showSeconds?: boolean): string {
  if (!showTime) return 'YYYY-MM-DD';
  return showSeconds !== false ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD HH:mm';
}

function getDefaultQuickSelects(
  showTime?: boolean,
  t?: (key: string) => string
): QuickSelectOption[] {
  const startOfDay = (d: Dayjs) => (showTime ? d.startOf('day') : d);
  const endOfDay = (d: Dayjs) => (showTime ? d.endOf('day') : d);

  return [
    {
      label: t?.('common.datePicker.today') ?? '今天',
      getValue: () => [startOfDay(dayjs()), endOfDay(dayjs())],
    },
    {
      label: t?.('common.datePicker.yesterday') ?? '昨天',
      getValue: () => [
        startOfDay(dayjs().subtract(1, 'day')),
        endOfDay(dayjs().subtract(1, 'day')),
      ],
    },
    {
      label: t?.('common.datePicker.last7Days') ?? '最近7天',
      getValue: () => [startOfDay(dayjs().subtract(6, 'day')), endOfDay(dayjs())],
    },
    {
      label: t?.('common.datePicker.last30Days') ?? '最近30天',
      getValue: () => [startOfDay(dayjs().subtract(29, 'day')), endOfDay(dayjs())],
    },
    {
      label: t?.('common.datePicker.thisMonth') ?? '本月',
      getValue: () => [startOfDay(dayjs().startOf('month')), endOfDay(dayjs().endOf('month'))],
    },
    {
      label: t?.('common.datePicker.lastMonth') ?? '上月',
      getValue: () => [
        startOfDay(dayjs().subtract(1, 'month').startOf('month')),
        endOfDay(dayjs().subtract(1, 'month').endOf('month')),
      ],
    },
  ];
}

// ----------------------------------------------------------------------
// RangeDay — Custom day component with range highlighting
// ----------------------------------------------------------------------

interface RangeDayExtras {
  rangeStart: Dayjs | null;
  rangeEnd: Dayjs | null;
  onDayHover?: (day: Dayjs | null) => void;
}

function RangeDay(props: PickersDayProps & RangeDayExtras) {
  const { rangeStart, rangeEnd, onDayHover, day, selected, outsideCurrentMonth, ...other } = props;

  // `selected` is intentionally destructured to prevent DateCalendar's own
  // selected logic from propagating — we compute our own below.
  void selected;

  if (outsideCurrentMonth) {
    return (
      <PickersDay
        {...other}
        day={day}
        outsideCurrentMonth
        disableMargin
        selected={false}
        sx={{ opacity: 0 }}
      />
    );
  }

  const isStart = rangeStart ? day.isSame(rangeStart, 'day') : false;
  const isEnd = rangeEnd ? day.isSame(rangeEnd, 'day') : false;
  const isEndpoint = isStart || isEnd;

  // Only show range background if start !== end
  const hasRange = rangeStart && rangeEnd && !rangeStart.isSame(rangeEnd, 'day');
  const isInRange = hasRange && day.isAfter(rangeStart, 'day') && day.isBefore(rangeEnd, 'day');
  const showBg = hasRange && (isInRange || isStart || isEnd);

  return (
    <Box
      onPointerEnter={() => onDayHover?.(day)}
      onPointerLeave={() => onDayHover?.(null)}
      sx={{
        position: 'relative',
        // Range background strip via pseudo-element
        ...(showBg && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: isStart ? '50%' : 0,
            right: isEnd ? '50%' : 0,
            bgcolor: (theme: Theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.12),
          },
        }),
      }}
    >
      <PickersDay
        {...other}
        day={day}
        outsideCurrentMonth={false}
        selected={isEndpoint || false}
        disableMargin
        sx={{
          zIndex: 1,
          position: 'relative',
        }}
      />
    </Box>
  );
}

// ----------------------------------------------------------------------
// TimeColumn — Scrollable column for hour / minute / second
// ----------------------------------------------------------------------

const ITEM_HEIGHT = 40;

interface TimeColumnProps {
  items: number[];
  value: number;
  onChange: (v: number) => void;
}

function TimeColumn({ items, value, onChange }: TimeColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to center the selected value
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const idx = items.indexOf(value);
    if (idx === -1) return;
    const top = idx * ITEM_HEIGHT - el.clientHeight / 2 + ITEM_HEIGHT / 2;
    el.scrollTop = Math.max(0, top);
  }, [value, items]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        '&:not(:last-of-type)': {
          borderRight: 1,
          borderColor: 'divider',
        },
      }}
    >
      {/* Scrollable list */}
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          width: 56,
          // Hide scrollbar for cleaner look
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: 2,
            bgcolor: 'action.disabled',
          },
        }}
      >
        {items.map((item) => (
          <ButtonBase
            key={item}
            onClick={() => onChange(item)}
            sx={{
              width: '100%',
              height: ITEM_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              typography: 'body2',
              borderRadius: 1,
              mx: 'auto',
              transition: (theme) =>
                theme.transitions.create(['background-color', 'color'], {
                  duration: theme.transitions.duration.shortest,
                }),
              ...(item === value
                ? {
                    bgcolor: (t: Theme) => varAlpha(t.vars.palette.primary.mainChannel, 0.12),
                    color: 'primary.main',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: (t: Theme) => varAlpha(t.vars.palette.primary.mainChannel, 0.2),
                    },
                  }
                : {
                    '&:hover': { bgcolor: 'action.hover' },
                  }),
            }}
          >
            {String(item).padStart(2, '0')}
          </ButtonBase>
        ))}
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------
// HeaderTab — Clickable start / end date display in the popover header
// ----------------------------------------------------------------------

interface HeaderTabProps {
  label: string;
  value: Dayjs | null;
  active: boolean;
  format: string;
  onClick: () => void;
}

function HeaderTab({ label, value, active, format, onClick }: HeaderTabProps) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 0.25,
        py: 1.5,
        px: 2,
        borderBottom: 2,
        borderColor: active ? 'primary.main' : 'transparent',
        transition: (theme) =>
          theme.transitions.create(['border-color'], {
            duration: theme.transitions.duration.short,
          }),
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: active ? 'primary.main' : 'text.secondary',
          fontWeight: 600,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: value ? 'text.primary' : 'text.disabled',
          fontWeight: active ? 600 : 400,
        }}
      >
        {value ? value.format(format) : '——'}
      </Typography>
    </ButtonBase>
  );
}

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export function DateTimeRangePicker({
  value,
  onChange,
  showTime = false,
  showSeconds = true,
  format: formatProp,
  size = 'small',
  label,
  placeholder,
  startLabel,
  endLabel,
  cancelText,
  confirmText,
  quickSelects,
  sx,
}: DateTimeRangePickerProps) {
  const { t } = useLanguage();
  const theme = useTheme();
  const anchorRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [activeField, setActiveField] = useState<ActiveField>('start');
  const [tempStart, setTempStart] = useState<Dayjs | null>(value[0]);
  const [tempEnd, setTempEnd] = useState<Dayjs | null>(value[1]);
  const [hoveredDate, setHoveredDate] = useState<Dayjs | null>(null);

  const displayFormat = formatProp || getDefaultFormat(showTime, showSeconds);
  const presets = quickSelects === false ? [] : quickSelects || getDefaultQuickSelects(showTime, t);

  const resolvedStartLabel = startLabel ?? t('common.datePicker.start');
  const resolvedEndLabel = endLabel ?? t('common.datePicker.end');
  const resolvedCancelText = cancelText ?? t('common.datePicker.cancel');
  const resolvedConfirmText = confirmText ?? t('common.datePicker.confirm');

  // ---- Derived display range (handles hover preview + normalization) ----

  const displayRange = useMemo(() => {
    let start = activeField === 'start' && hoveredDate ? hoveredDate : tempStart;
    let end = activeField === 'end' && hoveredDate ? hoveredDate : tempEnd;

    // Normalize: ensure start <= end
    if (start && end && start.isAfter(end, 'day')) {
      [start, end] = [end, start];
    }
    return [start, end] as const;
  }, [activeField, hoveredDate, tempStart, tempEnd]);

  // ---- Handlers ----

  const handleOpen = useCallback(() => {
    setTempStart(value[0]);
    setTempEnd(value[1]);
    setActiveField('start');
    setHoveredDate(null);
    setOpen(true);
  }, [value]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOk = useCallback(() => {
    let finalStart = tempStart;
    let finalEnd = tempEnd;

    // Ensure start <= end
    if (finalStart && finalEnd && finalStart.isAfter(finalEnd)) {
      [finalStart, finalEnd] = [finalEnd, finalStart];
    }

    onChange([finalStart, finalEnd]);
    setOpen(false);
  }, [tempStart, tempEnd, onChange]);

  const handleDateClick = useCallback(
    (date: Dayjs | null) => {
      if (!date) return;

      if (activeField === 'start') {
        const newStart = applyTime(date, tempStart);
        setTempStart(newStart);
        setActiveField('end');
      } else {
        const newEnd = applyTime(date, tempEnd);
        setTempEnd(newEnd);
      }
    },
    [activeField, tempStart, tempEnd]
  );

  const handleTimeChange = useCallback(
    (unit: 'hour' | 'minute' | 'second', val: number) => {
      const setter = activeField === 'start' ? setTempStart : setTempEnd;
      setter((prev) => {
        const base = prev || dayjs().startOf('day');
        return base.set(unit, val);
      });
    },
    [activeField]
  );

  const handleDayHover = useCallback((day: Dayjs | null) => {
    setHoveredDate(day);
  }, []);

  const handleQuickSelect = useCallback((preset: QuickSelectOption) => {
    const [start, end] = preset.getValue();
    setTempStart(start);
    setTempEnd(end);
    setActiveField('start');
  }, []);

  // ---- Active date for calendar navigation ----

  const calendarValue = activeField === 'start' ? tempStart : tempEnd;
  const activeDate = activeField === 'start' ? tempStart : tempEnd;

  // ---- Trigger display text ----

  const triggerText = useMemo(() => {
    const startText = value[0] ? value[0].format(displayFormat) : '';
    const endText = value[1] ? value[1].format(displayFormat) : '';
    if (!startText && !endText) return '';
    return `${startText || '——'} – ${endText || '——'}`;
  }, [value, displayFormat]);

  const defaultPlaceholder =
    placeholder ||
    (showTime
      ? t('common.datePicker.selectDateTimeRange')
      : t('common.datePicker.selectDateRange'));

  // ---- Render ----

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* Trigger input — uses real MUI TextField for consistent dark-mode styling */}
      <TextField
        ref={anchorRef}
        size={size}
        label={label}
        value={triggerText}
        placeholder={defaultPlaceholder}
        onClick={handleOpen}
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <Iconify
                  icon="solar:calendar-mark-bold-duotone"
                  sx={{ color: 'action.active', width: 20, height: 20 }}
                />
              </InputAdornment>
            ),
            sx: { cursor: 'pointer' },
          },
          htmlInput: { sx: { fieldSizing: 'content' } },
          inputLabel: label ? { shrink: true } : undefined,
        }}
        sx={[{ width: 'auto', minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
      />

      {/* Popover */}
      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              boxShadow: theme.vars.customShadows.dropdown,
              borderRadius: (Number(theme.shape.borderRadius) * 1.5) / 8,
            },
          },
        }}
      >
        <Box sx={{ display: 'flex' }}>
          {/* ---- Quick select sidebar ---- */}
          {presets.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRight: 1,
                borderColor: 'divider',
                py: 1,
                width: 100,
                flexShrink: 0,
              }}
            >
              {presets.map((preset) => {
                // Check if preset matches current temp values
                const [ps, pe] = preset.getValue();
                const isActive =
                  tempStart &&
                  tempEnd &&
                  ps &&
                  pe &&
                  tempStart.isSame(ps, 'second') &&
                  tempEnd.isSame(pe, 'second');

                return (
                  <ButtonBase
                    key={preset.label}
                    onClick={() => handleQuickSelect(preset)}
                    sx={{
                      py: 0.75,
                      px: 1.5,
                      typography: 'body2',
                      justifyContent: 'flex-start',
                      borderRadius: 0.75,
                      mx: 0.5,
                      color: isActive ? 'primary.main' : 'text.secondary',
                      fontWeight: isActive ? 600 : 400,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    {preset.label}
                  </ButtonBase>
                );
              })}
            </Box>
          )}

          {/* ---- Main panel ---- */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* ---- Header: Start / End tabs ---- */}
            <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
              <HeaderTab
                label={resolvedStartLabel}
                value={tempStart}
                active={activeField === 'start'}
                format={displayFormat}
                onClick={() => setActiveField('start')}
              />
              <Divider orientation="vertical" flexItem />
              <HeaderTab
                label={resolvedEndLabel}
                value={tempEnd}
                active={activeField === 'end'}
                format={displayFormat}
                onClick={() => setActiveField('end')}
              />
            </Box>

            {/* ---- Body: Calendar + Time ---- */}
            <Box sx={{ display: 'flex' }}>
              {/* Calendar */}
              <DateCalendar
                value={calendarValue}
                onChange={handleDateClick}
                slots={{ day: RangeDay as any }}
                slotProps={{
                  day: {
                    rangeStart: displayRange[0],
                    rangeEnd: displayRange[1],
                    onDayHover: handleDayHover,
                  } as any,
                }}
                sx={{
                  width: 320,
                  // Remove default margins for cleaner look
                  '& .MuiDayCalendar-weekContainer': {
                    mx: 0,
                  },
                }}
              />

              {/* Time columns */}
              {showTime && (
                <Box
                  sx={{
                    display: 'flex',
                    borderLeft: 1,
                    borderColor: 'divider',
                    maxHeight: 336,
                  }}
                >
                  <TimeColumn
                    items={HOURS}
                    value={activeDate?.hour() ?? 0}
                    onChange={(v) => handleTimeChange('hour', v)}
                  />
                  <TimeColumn
                    items={MINUTES}
                    value={activeDate?.minute() ?? 0}
                    onChange={(v) => handleTimeChange('minute', v)}
                  />
                  {showSeconds && (
                    <TimeColumn
                      items={SECONDS}
                      value={activeDate?.second() ?? 0}
                      onChange={(v) => handleTimeChange('second', v)}
                    />
                  )}
                </Box>
              )}
            </Box>

            {/* ---- Footer: Actions ---- */}
            <Divider />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1.5,
              }}
            >
              <Button size="small" onClick={handleClose}>
                {resolvedCancelText}
              </Button>
              <Button size="small" variant="contained" onClick={handleOk}>
                {resolvedConfirmText}
              </Button>
            </Box>
          </Box>
        </Box>
      </Popover>
    </LocalizationProvider>
  );
}
