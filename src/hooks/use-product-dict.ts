import useSWR from 'swr';
import { useMemo } from 'react';

import { useCountryStore } from 'src/stores';
import { getProductDict } from 'src/api/common';

type IProductType = 'payinChannel' | 'payoutChannel';
// type ProductDict = {
//   payinChannel: string[];
//   payoutChannel: string[];
//   // [key: string]: any;
// };

export function useProductDictList(type: IProductType) {
  const { selectedCountry } = useCountryStore();

  const key = selectedCountry ? ['dict', 'product', selectedCountry.code] : null;

  const { data } = useSWR(key, () => getProductDict(), {
    revalidateOnFocus: false,
  });

  return useMemo(() => {
    const r = data?.result;
    if (r && r[type]) return r[type] as string[];
    if (Array.isArray(r)) return r as string[];
    return [];
  }, [data, type]);
}
