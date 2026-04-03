import { CONFIG } from 'src/global-config';

import { DashboardOverviewView } from 'src/sections/dashboard';

// ----------------------------------------------------------------------

const metadata = { title: `概览 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <DashboardOverviewView />
    </>
  );
}
