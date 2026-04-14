import type { UseInViewOptions } from 'framer-motion';
import type { TypographyProps } from '@mui/material/Typography';

import { useRef, useEffect } from 'react';
import { m, animate, useInView, useTransform, useMotionValue } from 'framer-motion';

import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export type AnimateCountUpProps = TypographyProps & {
  to: number;
  from?: number;
  toFixed?: number;
  duration?: number;
  unit?: 'k' | 'm' | 'b' | string;
  once?: UseInViewOptions['once'];
  amount?: UseInViewOptions['amount'];
  /** Skip k/m/b shortening and display full number with thousand separators */
  disableShorten?: boolean;
};

export function AnimateCountUp({
  to,
  sx,
  from = 0,
  toFixed = 0,
  once = true,
  duration = 2,
  amount = 0.5,
  unit: unitProp,
  component = 'p',
  disableShorten,
  ...other
}: AnimateCountUpProps) {
  const countRef = useRef(null);

  const shortNumber = disableShorten ? undefined : shortenNumber(to);

  const startCount = useMotionValue<number>(from);
  const endCount = shortNumber ? shortNumber.value : to;

  const unit = unitProp ?? shortNumber?.unit;

  const inView = useInView(countRef, { once, amount });

  const rounded = useTransform(startCount, (latest) => {
    const fixed = latest.toFixed(isFloat(latest) ? toFixed : 0);
    if (disableShorten) {
      return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    return fixed;
  });

  useEffect(() => {
    if (inView) {
      animate(startCount, endCount, { duration });
    }
  }, [duration, endCount, inView, startCount]);

  return (
    <Typography
      component={component}
      sx={[
        {
          p: 0,
          m: 0,
          display: 'inline-flex',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <m.span ref={countRef}>{rounded}</m.span>
      {unit}
    </Typography>
  );
}

// ----------------------------------------------------------------------

function isFloat(n: number | string) {
  return typeof n === 'number' && !Number.isInteger(n);
}

function shortenNumber(value: number): { unit: string; value: number } | undefined {
  if (value >= 1e9) {
    return { unit: 'b', value: value / 1e9 };
  }
  if (value >= 1e6) {
    return { unit: 'm', value: value / 1e6 };
  }
  if (value >= 1e3) {
    return { unit: 'k', value: value / 1e3 };
  }
  return undefined;
}
