import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Security headers plugin
    {
      name: 'security-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Content Security Policy
          res.setHeader(
            'Content-Security-Policy',
            [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Needed for React hot reload
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.dicebear.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          );

          // Prevent clickjacking
          res.setHeader('X-Frame-Options', 'DENY');

          // Prevent MIME type sniffing
          res.setHeader('X-Content-Type-Options', 'nosniff');

          // Enable browser XSS protection
          res.setHeader('X-XSS-Protection', '1; mode=block');

          // Referrer policy
          res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

          // Permissions policy
          res.setHeader(
            'Permissions-Policy',
            'camera=(), microphone=(), geolocation=()'
          );

          next();
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8080,
    strictPort: false,
  },
});
