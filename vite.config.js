import { resolve } from "node:path"

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 8081
    },
    plugins: [
        vue(),
        Components({
            // allow auto load markdown components under `./src/components/`
            extensions: ['vue', 'md'],
            // allow auto import and register components used in markdown
            include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
            resolvers: [
                ElementPlusResolver({
                    importStyle: 'sass',
                }),
            ],
            dts: './src/components.d.ts',
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(import.meta.dirname, './src'),
        }
    },
    build: {
        lib: {
            entry: resolve(import.meta.dirname, "./src/components/index.js"),
            name: "Gallery",
            fileName: 'gallery',
        },
        rollupOptions: {
            external: ["vue"],
            output: {
                globals: {
                    vue: "Vue",
                },
                // keep css output name stable for the "./dist/style.css" export/import paths
                assetFileNames: (assetInfo) =>
                  assetInfo.name?.endsWith(".css")
                    ? "style.css"
                    : "assets/[name][extname]",
            },
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
              api: 'modern-compiler',
              additionalData: `@use '@/assets/styles' as *;`
            }
        }
    }
})
