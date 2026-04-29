import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type SignatureStepsProps = {
  steps: {
    timestamp: string;
    nonce: string;
    sortedParams: string;
    signData: string;
    signature: string;
    originalBody: Record<string, any>;
  };
};

function CodeBlock({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <Box>
      {label && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          {label}
        </Typography>
      )}
      <Box
        component="pre"
        sx={{
          p: 1.5,
          borderRadius: 1,
          bgcolor: 'background.neutral',
          fontFamily: 'monospace',
          fontSize: 'body2.fontSize',
          overflow: 'auto',
          m: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function StepNumber({ n }: { n: number }) {
  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'caption.fontSize',
        fontWeight: 'fontWeightBold',
        flexShrink: 0,
      }}
    >
      {n}
    </Box>
  );
}

function ArrowDown() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
      <Iconify icon="solar:arrow-down-bold" width={20} sx={{ color: 'text.disabled' }} />
    </Box>
  );
}

export function SignatureSteps({ steps }: SignatureStepsProps) {
  const { t } = useLanguage();

  // Build the sorted entries to show transformation
  const originalEntries = Object.entries(steps.originalBody).filter(
    ([, v]) => v !== null && v !== undefined && v !== ''
  );
  const sortedEntries = [...originalEntries].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

  return (
    <Card>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
          <Iconify icon="solar:key-bold" color="warning.main" />
          <Typography variant="subtitle1">{t('apiPlayground.signatureProcess')}</Typography>
        </Stack>

        <Stack spacing={0}>
          {/* Step 1: Timestamp & Nonce */}
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <StepNumber n={1} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('apiPlayground.step1Title')}
              </Typography>
              <Stack spacing={1}>
                <CodeBlock label="TIMESTAMP">{steps.timestamp}</CodeBlock>
                <CodeBlock label="NONCE">{steps.nonce}</CodeBlock>
              </Stack>
            </Box>
          </Stack>

          <ArrowDown />

          {/* Step 2: Sort params — show original vs sorted */}
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <StepNumber n={2} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                {t('apiPlayground.step2Title')}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                {t('apiPlayground.step2Desc')}
              </Typography>

              {/* Original order */}
              <CodeBlock label={t('apiPlayground.originalParams')}>
                {originalEntries.map(([k, v]) => `${k}=${v}`).join('\n')}
              </CodeBlock>

              <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
                <Iconify
                  icon="solar:sort-vertical-bold"
                  width={18}
                  sx={{ color: 'warning.main' }}
                />
              </Box>

              {/* Sorted result */}
              <CodeBlock label={t('apiPlayground.sortedResult')}>
                {sortedEntries.map(([k, v]) => `${k}=${v}`).join('\n')}
              </CodeBlock>

              <ArrowDown />

              {/* Joined string */}
              <CodeBlock label={t('apiPlayground.joinedString')}>{steps.sortedParams}</CodeBlock>
            </Box>
          </Stack>

          <ArrowDown />

          {/* Step 3: Build sign data */}
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <StepNumber n={3} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                {t('apiPlayground.step3Title')}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                {t('apiPlayground.step3Desc')}
              </Typography>

              {/* Show formula */}
              <CodeBlock label={t('apiPlayground.formula')}>
                TIMESTAMP + &quot;|&quot; + NONCE + &quot;|&quot; + PARAMS
              </CodeBlock>

              <ArrowDown />

              {/* Show actual concatenation with highlighting */}
              <CodeBlock label={t('apiPlayground.actualValue')}>
                <Box component="span" sx={{ color: 'info.main' }}>
                  {steps.timestamp}
                </Box>
                <Box component="span" sx={{ color: 'text.secondary' }}>
                  |
                </Box>
                <Box component="span" sx={{ color: 'success.main' }}>
                  {steps.nonce}
                </Box>
                <Box component="span" sx={{ color: 'text.secondary' }}>
                  |
                </Box>
                <Box component="span" sx={{ color: 'warning.main' }}>
                  {steps.sortedParams}
                </Box>
              </CodeBlock>
            </Box>
          </Stack>

          <ArrowDown />

          {/* Step 4: Ed25519 sign */}
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <StepNumber n={4} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                {t('apiPlayground.step4Title')}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                {t('apiPlayground.step4Desc')}
              </Typography>

              <Divider sx={{ my: 1 }} />

              <CodeBlock label="X-API-SIGN">{steps.signature}</CodeBlock>
            </Box>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}
