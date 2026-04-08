import { CONFIG } from 'src/global-config';

import { FundsDetailView } from 'src/sections/fund/funds-detail';

// ----------------------------------------------------------------------

const metadata = { title: `资金明细 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <FundsDetailView />
    </>
  );
}
