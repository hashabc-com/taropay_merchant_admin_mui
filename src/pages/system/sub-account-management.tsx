import { CONFIG } from 'src/global-config';

import { SubAccountManagementView } from 'src/sections/system/sub-account-management';

// ----------------------------------------------------------------------

const metadata = { title: `子账号管理 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <SubAccountManagementView />
    </>
  );
}
