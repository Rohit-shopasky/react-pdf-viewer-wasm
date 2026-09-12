import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react(), dts({ rollupTypes: true })],
    build: {
        // Never inline wasm as base64 — it must be emitted as a separate file
        assetsInlineLimit: 0,
        lib: {
            entry: resolve(import.meta.dirname, 'src/index.ts'),
            name: 'ReactPdfViewerWasm',
            fileName: () => 'index.mjs',
            formats: ['es'],
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'react/jsx-runtime'],
            output: {
                globals: { react: 'React', 'react-dom': 'ReactDOM' },
                // Keep wasm filename stable (no hash) so the published bundle
                // can always resolve it as a sibling file in dist/
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name?.endsWith('.wasm')) return '[name][extname]';
                    return 'assets/[name]-[hash][extname]';
                },
            },
        },
    },
    assetsInclude: ['**/*.wasm'],
});
