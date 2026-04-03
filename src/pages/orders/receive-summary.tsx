import { CONFIG } from 'src/global-config';

import { ReceiveSummaryView } from 'src/sections/orders/receive-summary';

// ----------------------------------------------------------------------

const metadata = { title: `收款汇总 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <ReceiveSummaryView />
    </>
  );
}
