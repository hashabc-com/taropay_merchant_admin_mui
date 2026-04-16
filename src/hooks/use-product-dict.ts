import useSWR from 'swr';
import { useMemo } from 'react';

import { useMerchantStore } from 'src/stores';
import { getProductDict } from 'src/api/common';

type IProductType = 'payinChannel' | 'payoutChannel';
// type ProductDict = {
//   payinChannel: string[];
//   payoutChannel: string[];
//   // [key: string]: any;
// };

export function useProductDictList(type: IProductType) {
  const countryCode = useMerchantStore((s) =>
    s.selectedMerchant ? s.selectedMerchant.country : undefined
  );
  // const { userInfo } = useAuthStore();

  // const key = selectedCountry ? ['dict', 'product', selectedCountry.code] : null;
  const key = ['dict', 'product', countryCode];

  const { data } = useSWR(key, () => getProductDict(countryCode || ''), {
    revalidateOnFocus: false,
  });

  return useMemo(() => {
    const r = data?.result;
    if (r && r[type]) return r[type] as string[];
    if (Array.isArray(r)) return r as string[];
    return [];
  }, [data, type]);
}
