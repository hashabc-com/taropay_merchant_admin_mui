import { CONFIG } from 'src/global-config';

import { ComingSoonView } from 'src/sections/error';

// ----------------------------------------------------------------------

const metadata = { title: `Coming soon | ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <ComingSoonView />
    </>
  );
}
