import { Buffer } from 'buffer';

if (typeof globalThis.process === 'undefined') {
  (globalThis as any).process = {
    env: { NODE_ENV: import.meta.env.MODE || 'production' },
    version: '',
    cwd: () => '/',
  };
}

if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}
