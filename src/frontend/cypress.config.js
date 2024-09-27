// Use 'import' em vez de 'require'
import { defineConfig } from 'cypress';

export default defineConfig({
  env: {
    VITE_URL_API_BACKEND: "http://localhost:3000"
  },
  e2e: {
    setupNodeEvents(on, config) {
    },
    baseUrl: 'http://10.150.1.253:5173',
  },
});
