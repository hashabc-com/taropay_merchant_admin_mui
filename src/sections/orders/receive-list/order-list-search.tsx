import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import { useListSearch } from 'src/hooks/use-list-search';
import { useProductDictList } from 'src/hooks/use-product-dict';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';
import { DateTimeRangePicker } from 'src/components/date-time-range-picker';

import { FIELD_KEYS } from './hooks';
import { ORDER_STATUS_MAP } from './types';

// ----------------------------------------------------------------------

export function OrderListSearch() {
  const { t } = useLanguage();
  const { values, setField, hasFilters, handleSearch, handleReset, handleKeyDown } =
    useListSearch(FIELD_KEYS);
  const productDict = useProductDictList('payinChannel');

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 3 }}>
      {/* Date range */}
      <DateTimeRangePicker
        value={[
          values.startTime ? dayjs(values.startTime) : null,
          values.endTime ? dayjs(values.endTime) : null,
        ]}
        onChange={([start, end]) => {
          setField('startTime', start ? start.format('YYYY-MM-DD HH:mm:ss') : '');
          setField('endTime', end ? end.format('YYYY-MM-DD HH:mm:ss') : '');
        }}
        showTime
        size="small"
        startLabel={t('common.startTime')}
        endLabel={t('common.endTime')}
      />

      {/* Search inputs */}
      <TextField
        size="small"
        placeholder={t('orders.receiveOrders.merchantOrderNo')}
        value={values.referenceno}
        onChange={(e) => setField('referenceno', e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ width: 160 }}
      />
      <TextField
        size="small"
        placeholder={t('orders.receiveOrders.platformOrderNo')}
        value={values.transId}
        onChange={(e) => setField('transId', e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ width: 160 }}
      />
      <TextField
        size="small"
        placeholder={t('orders.receiveOrders.mobile')}
        value={values.mobile}
        onChange={(e) => setField('mobile', e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ width: 140 }}
      />
      <TextField
        size="small"
        placeholder={t('signIn.username')}
        value={values.userName}
        onChange={(e) => setField('userName', e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ width: 130 }}
      />

      {/* Status select */}
      <FormControl size="small" sx={{ width: 130 }}>
        <InputLabel shrink>{t('orders.receiveOrders.status')}</InputLabel>
        <Select
          displayEmpty
          label={t('orders.receiveOrders.status')}
          notched
          value={values.status}
          onChange={(e) => setField('status', e.target.value)}
          renderValue={(selected) => {
            if (!selected) {
              return <span style={{ color: '#aaa' }}>{t('common.pleaseSelect')}</span>;
            }
            return ORDER_STATUS_MAP[selected]?.label || selected;
          }}
        >
          {Object.entries(ORDER_STATUS_MAP).map(([key, { label }]) => (
            <MenuItem key={key} value={key}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {/* Product select */}
      <FormControl size="small" sx={{ width: 130 }}>
        <InputLabel shrink>{t('common.product')}</InputLabel>
        <Select
          displayEmpty
          label={t('common.product')}
          notched
          value={values.pickupCenter}
          onChange={(e) => setField('pickupCenter', e.target.value)}
          renderValue={(selected) => {
            if (!selected) {
              return <span style={{ color: '#aaa' }}>{t('common.pleaseSelect')}</span>;
            }
            return selected;
          }}
        >
          {productDict.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Buttons */}
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
    </Box>
  );
}
