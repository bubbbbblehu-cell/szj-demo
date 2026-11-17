import { defineConfig, loadEnv } from 'vite';
import { cpSync } from 'node:fs';

export default defineConfig(({ mode }) => {
  const remote = loadEnv(mode, process.cwd(), 'VITE_').VITE_MEDIA_BASE_URL;
  return {
    plugins: [{
      name: 'local-media',
      transformIndexHtml() {
        if (!/^https?:\/\//.test(remote ?? '')) return [];
        return [{ tag: 'link', attrs: { rel: 'preconnect', href: new URL(remote).origin }, injectTo: 'head' }];
      },
      closeBundle() {
        if (!remote) cpSync('media', 'dist/media', { recursive: true });
      },
    }],
  };
});
