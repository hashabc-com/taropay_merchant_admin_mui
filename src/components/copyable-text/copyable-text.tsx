import { toast } from 'sonner';

import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type CopyableTextProps = {
  value: string | undefined | null;
  placeholder?: string;
};

export function CopyableText({ value, placeholder = '-' }: CopyableTextProps) {
  const { t } = useLanguage();

  if (!value) return <>{placeholder}</>;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(t('common.copied'));
    } catch {
      toast.error(t('common.copyFailed'));
    }
  };

  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <span>{value}</span>
      <IconButton size="small" onClick={handleCopy} sx={{ p: 0.25 }}>
        <Iconify icon="solar:copy-bold" width={16} />
      </IconButton>
    </Stack>
  );
}
