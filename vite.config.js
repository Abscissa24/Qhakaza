import { defineConfig } from 'vite';

export default defineConfig({
  // './' keeps asset URLs relative so the site works on GitHub Project Pages
  // (https://<user>.github.io/<repo>/) and on custom domains alike.
  base: './',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
