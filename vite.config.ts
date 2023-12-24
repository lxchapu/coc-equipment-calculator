import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import yaml from '@rollup/plugin-yaml'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue'],
      resolvers: [ElementPlusResolver()],
      dts: './types/auto-imports.d.ts' 
    }),
    Components({
      dirs: [],
      resolvers: [ElementPlusResolver()],
      dts: './types/components.d.ts'
    }),
    yaml(),
  ],
  server: {
    port: 3000,
  },
})
