import useSWR from 'swr';

import { useCountryStore } from 'src/stores';
import { getPaymentChannel } from 'src/api/order';

export function usePaymentChannel() {
  const { selectedCountry } = useCountryStore();

  const key = selectedCountry ? ['payment', 'channels', selectedCountry.code] : null;

  const { data } = useSWR(key, getPaymentChannel, {
    revalidateOnFocus: false,
  });

  return (data?.result || []) as string[];
}
