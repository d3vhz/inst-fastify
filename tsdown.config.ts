import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/**/*.ts'],
  outDir: 'dist',
  format: ['esm'],
  dts: true,
  clean: true,
  platform: 'node',
  target: 'node22',
  sourcemap: true,
  deps: {
    neverBundle: true,
  },
  outExtension: () => ({ js: '.js' }),

})