import { CONFIG } from 'src/global-config';

import { TransactionSummaryView } from 'src/sections/orders/transaction-summary';

// ----------------------------------------------------------------------

const metadata = { title: `交易汇总 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <TransactionSummaryView />
    </>
  );
}
