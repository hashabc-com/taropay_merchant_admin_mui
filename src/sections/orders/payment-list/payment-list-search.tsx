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

import { FIELD_KEYS, PAYMENT_STATUS_MAP } from './hooks';

// ----------------------------------------------------------------------

export function PaymentListSearch() {
  const { t } = useLanguage();
  const { values, setField, hasFilters, handleSearch, handleReset, handleKeyDown } =
    useListSearch(FIELD_KEYS);
  const productDict = useProductDictList('payoutChannel');

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 3 }}>
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

      <TextField
        size="small"
        placeholder={t('orders.paymentOrders.merchantOrderNo')}
        value={values.refNo}
        onChange={(e) => setField('refNo', e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ width: 160 }}
      />
      <TextField
        size="small"
        placeholder={t('orders.paymentOrders.platformOrderNo')}
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
        placeholder={t('orders.paymentOrders.receivingAccount')}
        value={values.accountNumber}
        onChange={(e) => setField('accountNumber', e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ width: 140 }}
      />

      <FormControl size="small" sx={{ width: 130 }}>
        <InputLabel shrink>{t('orders.paymentOrders.status')}</InputLabel>
        <Select
          displayEmpty
          label={t('orders.paymentOrders.status')}
          notched
          value={values.status}
          onChange={(e) => setField('status', e.target.value)}
          renderValue={(sel) => {
            if (!sel) return <span style={{ color: '#aaa' }}>{t('common.pleaseSelect')}</span>;
            return PAYMENT_STATUS_MAP[sel]?.label || sel;
          }}
        >
          {Object.entries(PAYMENT_STATUS_MAP).map(([key, { label }]) => (
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
