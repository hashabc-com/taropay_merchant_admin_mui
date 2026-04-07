import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { useListSearch } from 'src/hooks/use-list-search';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';
import { DateTimeRangePicker } from 'src/components/date-time-range-picker';

import { FIELD_KEYS } from './hooks';

// ----------------------------------------------------------------------

type Props = {
  onExport: (params: { startTime?: string; endTime?: string }) => void;
};

export function TransactionSummarySearch({ onExport }: Props) {
  const { t } = useLanguage();
  const { values, setField, hasFilters, handleSearch, handleReset } = useListSearch(FIELD_KEYS);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 3 }}>
      <DateTimeRangePicker
        value={[
          values.startTime ? dayjs(values.startTime) : null,
          values.endTime ? dayjs(values.endTime) : null,
        ]}
        onChange={([start, end]) => {
          setField('startTime', start ? start.format('YYYY-MM-DD') : '');
          setField('endTime', end ? end.format('YYYY-MM-DD') : '');
        }}
        size="small"
        startLabel={t('common.startTime')}
        endLabel={t('common.endTime')}
      />

      <Button
        variant="contained"
        size="small"
        onClick={handleSearch}
        startIcon={<Iconify icon="eva:search-fill" />}
      >
        {t('common.search')}
      </Button>

      {hasFilters && (
        <Button
          variant="outlined"
          size="small"
          onClick={handleReset}
          startIcon={<Iconify icon="solar:close-circle-bold" />}
        >
          {t('common.reset')}
        </Button>
      )}

      <Button
        variant="outlined"
        size="small"
        startIcon={<Iconify icon="solar:export-bold" />}
        onClick={() =>
          onExport({
            startTime: values.startTime || undefined,
            endTime: values.endTime || undefined,
          })
        }
      >
        {t('common.export')}
      </Button>
    </Box>
  );
}
