import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente do nível do sistema (para o Vercel)
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Permite o uso de process.env.API_KEY no código do navegador
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})