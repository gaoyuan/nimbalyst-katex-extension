import { defineConfig } from 'vite';
import { createExtensionConfig } from '@nimbalyst/extension-sdk/vite';

const base = createExtensionConfig({ entry: './src/index.ts' });

// The SDK's default `assetFileNames` uses the Vite 7 `assetInfo.names`
// array; we run on Vite 4 (Node 16 compatibility) where the field is the
// singular `name`. Override here so KaTeX's CSS lands at `dist/index.css`
// to match `manifest.styles`.
export default defineConfig({
  ...base,
  build: {
    ...base.build,
    rollupOptions: {
      ...base.build?.rollupOptions,
      output: {
        ...((base.build?.rollupOptions?.output as any) ?? {}),
        assetFileNames: (assetInfo: { name?: string; names?: string[] }) => {
          const name = assetInfo.name ?? assetInfo.names?.[0] ?? 'asset';
          if (name.endsWith('.css')) return 'index.css';
          return name;
        },
      },
    },
  },
});
