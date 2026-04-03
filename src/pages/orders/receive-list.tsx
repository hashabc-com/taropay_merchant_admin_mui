import { CONFIG } from 'src/global-config';

import { OrderListView } from 'src/sections/orders/receive-list';

// ----------------------------------------------------------------------

const metadata = { title: `收款订单明细 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <OrderListView />
    </>
  );
}
