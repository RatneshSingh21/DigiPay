import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: 'web.config',
          dest: ''
        }
      ]
    })
  ],

  server: {
    port: 5175,
    strictPort: true, // optional: prevents switching to another port
  },
})
