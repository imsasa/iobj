import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  root: 'src',
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

