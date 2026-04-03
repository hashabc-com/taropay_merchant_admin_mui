import { CONFIG } from 'src/global-config';

import { SettlementListView } from 'src/sections/fund/settlement-list';

// ----------------------------------------------------------------------

const metadata = { title: `结算记录 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <SettlementListView />
    </>
  );
}
