import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  project: ['src/**/*.{ts,tsx}'],
  ignoreDependencies: ['@fontsource-variable/*', '@fontsource/*'],
};

export default config;
