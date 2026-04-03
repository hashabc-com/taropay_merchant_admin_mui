import type { BoxProps } from '@mui/material/Box';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';
import { useLanguage } from 'src/context/language-provider';

import { varFade, MotionContainer } from 'src/components/animate';

// ----------------------------------------------------------------------

export type DataGridEmptyOverlayProps = BoxProps & {
  title?: string;
  description?: string;
  imgUrl?: string;
};

export function DataGridEmptyOverlay({
  title,
  description,
  imgUrl,
  sx,
  ...other
}: DataGridEmptyOverlayProps) {
  const { t } = useLanguage();

  return (
    <Box
      component={MotionContainer}
      sx={[
        {
          py: 6,
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <m.div variants={varFade('inUp', { distance: 24 })}>
        <Box
          component="img"
          alt="empty content"
          src={imgUrl || `${CONFIG.assetsDir}/assets/icons/empty/ic-content.svg`}
          sx={{ width: 120, height: 120, mb: 2 }}
        />
      </m.div>

      <m.div variants={varFade('inUp', { distance: 24 })}>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 0.5 }}>
          {title || t('common.noDataTitle')}
        </Typography>
      </m.div>

      <m.div variants={varFade('inUp', { distance: 24 })}>
        <Typography variant="body2" sx={{ color: 'text.disabled' }}>
          {description || t('common.noDataDescription')}
        </Typography>
      </m.div>
    </Box>
  );
}
