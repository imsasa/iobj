import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: './',
  plugins: [vue()],
  root: 'src',
  build: {
    outDir: '../dist'
  },
  resolve: {
    dedupe: ['vue']
  },
  server: {
    fs: {
      // 允许为项目根目录的上一级提供服务（即整个 monorepo）
      allow: ['../..']
    }
  }
})

