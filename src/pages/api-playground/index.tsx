import { CONFIG } from 'src/global-config';

import { ApiPlaygroundView } from 'src/sections/api-playground';

// ----------------------------------------------------------------------

const metadata = { title: `API Playground - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <ApiPlaygroundView />
    </>
  );
}
