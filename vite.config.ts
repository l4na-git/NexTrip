import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // tailscale serve 経由(*.ts.net)のホスト名を許可する
    allowedHosts: ['.ts.net'],
  },
})
