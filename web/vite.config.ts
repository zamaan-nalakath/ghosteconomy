import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

const midnightRoot = path.resolve(__dirname, 'node_modules/@midnight-ntwrk');
const midnightPackages = fs.readdirSync(midnightRoot);
const midnightAliases = Object.fromEntries(
  midnightPackages
    .filter((pkg) => pkg !== 'midnight-js-protocol')
    .map((pkg) => [`@midnight-ntwrk/${pkg}`, path.join(midnightRoot, pkg)]),
);

export default defineConfig({
  define: { global: 'globalThis' },
  plugins: [react(), wasm(), topLevelAwait(), tailwindcss()],
  resolve: {
    alias: {
      '@contracts': path.resolve(__dirname, '../contracts'),
      '@api': path.resolve(__dirname, '../api/src'),
      buffer: 'buffer/',
      ...midnightAliases,
    },
    dedupe: midnightPackages.map((pkg) => `@midnight-ntwrk/${pkg}`),
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.wasm'],
    mainFields: ['browser', 'module', 'main'],
  },
  build: {
    target: 'esnext',
    commonjsOptions: {
      transformMixedEsModules: true,
      extensions: ['.js', '.cjs'],
      ignoreDynamicRequires: true,
    },
  },
  server: { port: 5173, fs: { allow: ['..'] } },
  optimizeDeps: {
    include: [
      'buffer',
      '@midnight-ntwrk/compact-runtime',
      '@midnight-ntwrk/ledger-v8',
      '@midnight-ntwrk/midnight-js-contracts',
      '@midnight-ntwrk/midnight-js-http-client-proof-provider',
    ],
    esbuildOptions: {
      target: 'esnext',
      supported: { 'top-level-await': true },
      platform: 'browser',
      format: 'esm',
      define: { global: 'globalThis' },
      loader: { '.wasm': 'binary' },
    },
  },
});
