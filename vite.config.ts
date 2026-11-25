import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Single source of truth for the production URL (used in index.html OG/canonical tags).
// Override via VITE_SITE_URL env var or update DEFAULT_SITE_URL for a custom domain.
const DEFAULT_SITE_URL = 'https://j-pennywise.vercel.app';
const siteUrl = (process.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'html-site-url',
      transformIndexHtml(html) {
        return html.replace(/%SITE_URL%/g, siteUrl);
      },
    },
  ],
});
