import { CONFIG } from 'src/global-config';

import { RechargeWithdrawView } from 'src/sections/fund/recharge-withdraw';

// ----------------------------------------------------------------------

const metadata = { title: `申请审批 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <RechargeWithdrawView />
    </>
  );
}
