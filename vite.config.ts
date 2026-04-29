import path from 'path';
import checker from 'vite-plugin-checker';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

const PORT = 8081;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      checker({
        typescript: true,
        eslint: {
          useFlatConfig: true,
          lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
          dev: { logLevel: ['error'] },
        },
        overlay: {
          position: 'tl',
          initialIsOpen: false,
        },
      }),
    ],
    server: {
      host: true,
      proxy: {
        '/customer': {
          target: env.VITE_PROXY_TARGET,
          changeOrigin: true,
          secure: false,
        },
        '/sandbox-api': {
          target: 'https://sandbox.taropay.com',
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/sandbox-api/, '/api'),
        },
      },
    },
    resolve: {
      alias: [
        {
          find: /^src(.+)/,
          replacement: path.resolve(process.cwd(), 'src/$1'),
        },
      ],
    },
    preview: { port: PORT, host: true },
    build: {
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-mui': ['@mui/material', '@mui/lab'],
            'vendor-datagrid': ['@mui/x-data-grid'],
            'vendor-react': ['react', 'react-dom', 'react-router'],
          },
        },
      },
    },
  };
});
