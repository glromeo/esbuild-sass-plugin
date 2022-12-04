import { sassPlugin } from 'esbuild-sass-plugin';
import { defineConfig } from 'tsup';

export default defineConfig({
    entryPoints: ['src/index.ts'],
    outDir: 'dist',
    sourcemap: true,
    esbuildPlugins: [
        sassPlugin()
    ]
});
