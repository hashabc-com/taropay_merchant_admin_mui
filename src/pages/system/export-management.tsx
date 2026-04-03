import { CONFIG } from 'src/global-config';

import { ExportManagementView } from 'src/sections/system/export-management';

// ----------------------------------------------------------------------

const metadata = { title: `导出管理 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <ExportManagementView />
    </>
  );
}
