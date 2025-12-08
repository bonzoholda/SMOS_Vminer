import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // The 'plugins' array is where you add framework support.
  // We use '@vitejs/plugin-react' to properly handle JSX and React Fast Refresh.
  plugins: [react()],
  
  // This object allows for advanced build customization.
  build: {
    // The 'outDir' should match the 'Publish directory' setting in Netlify.
    // The default Vite setting is 'dist', which is what Netlify expects.
    outDir: 'dist',
  },

  // This section is useful for fixing common issues in Web3 libraries.
  // Ethers.js v5 and older versions sometimes needed 'polyfill' settings, 
  // but v6 is usually fine. We include this standard pattern for robustness.
  resolve: {
    alias: {
      // You can add aliases here if needed (e.g., '@': '/src')
    },
  },
  
  // Add server configuration for local development if needed, 
  // but for a basic frontend, the defaults are usually fine.
  server: {
    // Optional: open the browser automatically on 'npm run dev'
    // open: true,
  }
});
