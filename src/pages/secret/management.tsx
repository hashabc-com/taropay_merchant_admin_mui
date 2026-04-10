import { CONFIG } from 'src/global-config';

import { SecretManagementView } from 'src/sections/secret';

// ----------------------------------------------------------------------

const metadata = { title: `密钥管理 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <SecretManagementView />
    </>
  );
}
