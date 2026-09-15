import path from 'path';
import { defineConfig } from 'vitepress';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

const versionNumber = process.env.npm_package_version;

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Gallery',
  description: 'API documentation for Gallery',
  base: '/mapcore-gallery/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'API Reference',
        link: '/components/Gallery',
      },
    ],

    sidebar: [
      {
        text: 'Live Demo',
        link: '/demo',
      },
      {
        text: 'API Reference',
        link: '/components/Gallery',
      },
      {
        text: 'Version',
        items: [
          {
            text: `${versionNumber}`,
          },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/ABI-Software/mapcore-gallery' }],
  },
  markdown: { attrs: { disable: true } },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use '../src/assets/styles' as *;`,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../../src'),
      },
    },
    plugins: [
      Components({
        // Allow auto load markdown components under `./src/components/`.
        extensions: ['vue'],
        // Allow auto import and register the components used in markdown.
        include: [/\.vue$/, /\.vue\?vue/],
        resolvers: [
          ElementPlusResolver({
            importStyle: 'css',
          }),
        ],
      }),
    ],
  },
});
