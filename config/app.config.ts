export const appConfig = {
  // App Information
  title: 'Saurab Shrestha — Software Developer',
  description: 'Saurab Shrestha — Software Developer specializing in AI/ML and full-stack development from Bhaktapur, Nepal.',
  version: '1.0.0',

  // Canonical origin + base path. Must stay in sync with `base` in vite.config.ts.
  siteUrl: 'https://saurab-shrestha.github.io/SaurabShrestha/',

  // Development Settings
  dev: {
    port: 3000,
    previewPort: 4173,
    host: true,
    open: true,
  },

  // Build Settings
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },

  // Social Media Links
  social: {
    linkedin: 'https://www.linkedin.com/in/saurab-shrestha-092090182/',
    github: 'https://github.com/Saurab-Shrestha',
  },

  // Contact Information
  contact: {
    email: 'shresthasaurab030@gmail.com',
    phone: '+977-9823590047',
  },
} as const;

export type AppConfig = typeof appConfig;