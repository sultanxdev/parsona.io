// Frontend Environment Configuration
const config = {
  // API
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',

  // OAuth URLs
  googleAuthUrl: import.meta.env.VITE_GOOGLE_AUTH_URL || 'http://localhost:5000/api/auth/google',
  linkedinAuthUrl: import.meta.env.VITE_LINKEDIN_AUTH_URL || 'http://localhost:5000/api/auth/linkedin',

  // App
  appName: import.meta.env.VITE_APP_NAME || 'PersonaPilot',
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',

  // Feature Flags
  features: {
    googleAuth: import.meta.env.VITE_ENABLE_GOOGLE_AUTH === 'true',
    linkedinAuth: import.meta.env.VITE_ENABLE_LINKEDIN_AUTH === 'true',
    emailAuth: import.meta.env.VITE_ENABLE_EMAIL_AUTH === 'true'
  },

  // Analytics
  analytics: {
    gaTrackingId: import.meta.env.VITE_GA_TRACKING_ID,
    hotjarId: import.meta.env.VITE_HOTJAR_ID
  },

  // Environment
  isDevelopment: import.meta.env.VITE_NODE_ENV === 'development',
  isProduction: import.meta.env.VITE_NODE_ENV === 'production'
}

export default config
