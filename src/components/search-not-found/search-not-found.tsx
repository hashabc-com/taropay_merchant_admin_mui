import type { BoxProps } from '@mui/material/Box';
import type { Theme, SxProps } from '@mui/material/styles';
import type { TypographyProps } from '@mui/material/Typography';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';
import { useLanguage } from 'src/context/language-provider';

// ----------------------------------------------------------------------

type SearchNotFoundProps = BoxProps & {
  query?: string;
  sx?: SxProps<Theme>;
  slotProps?: {
    title?: TypographyProps;
    description?: TypographyProps;
  };
};

export function SearchNotFound({ query, sx, slotProps, ...other }: SearchNotFoundProps) {
  const { t } = useLanguage();

  if (!query) {
    return (
      <Typography variant="body2" {...slotProps?.description}>
        {t('common.enterKeywords')}
      </Typography>
    );
  }

  return (
    <Box
      sx={[
        {
          gap: 1,
          display: 'flex',
          borderRadius: 1.5,
          textAlign: 'center',
          flexDirection: 'column',
          alignItems: 'center',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box
        component="img"
        alt="search not found"
        src={`${CONFIG.assetsDir}/assets/icons/empty/ic-content.svg`}
        sx={{ width: 80, height: 80, mb: 1 }}
      />

      <Typography
        variant="h6"
        {...slotProps?.title}
        sx={[
          { color: 'text.primary' },
          ...(Array.isArray(slotProps?.title?.sx) ? slotProps.title.sx : [slotProps?.title?.sx]),
        ]}
      >
        {t('common.notFound')}
      </Typography>

      <Typography variant="body2" {...slotProps?.description}>
        {t('common.noResultsFor')}&nbsp;
        <strong>{`"${query}"`}</strong>
      </Typography>
    </Box>
  );
}
