import { CONFIG } from 'src/global-config';

import { PaymentListView } from 'src/sections/orders/payment-list';

// ----------------------------------------------------------------------

const metadata = { title: `付款订单明细 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <PaymentListView />
    </>
  );
}
