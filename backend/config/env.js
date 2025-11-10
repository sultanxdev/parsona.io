// Global Environment Configuration
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../.env') })

const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  apiUrl: process.env.API_URL || 'http://localhost:5000',

  // Database
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/personapilot',

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },

  // OAuth - Authentication
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL
    },
    linkedin: {
      clientId: process.env.LINKEDIN_AUTH_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_AUTH_CLIENT_SECRET,
      callbackUrl: process.env.LINKEDIN_AUTH_CALLBACK_URL
    }
  },

  // Social Media Connections
  connections: {
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      bearerToken: process.env.TWITTER_BEARER_TOKEN,
      callbackUrl: process.env.TWITTER_CALLBACK_URL
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackUrl: process.env.LINKEDIN_CALLBACK_URL
    }
  },

  // AI Services
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-pro'
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229'
    }
  },

  // Vector Database
  vectorDB: {
    provider: process.env.VECTOR_DB_PROVIDER || 'pinecone', // pinecone, chroma, qdrant
    pinecone: {
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
      indexName: process.env.PINECONE_INDEX_NAME || 'parsona-embeddings'
    },
    chroma: {
      url: process.env.CHROMA_URL || 'http://localhost:8000',
      collection: process.env.CHROMA_COLLECTION || 'parsona'
    }
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB) || 0
  },

  // BullMQ
  queue: {
    redis: process.env.REDIS_URL || 'redis://localhost:6379',
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: {
        age: 86400, // 24 hours
        count: 1000
      },
      removeOnFail: {
        age: 604800 // 7 days
      }
    }
  },

  // Payment
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },

  // Email
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'Parsona <noreply@parsona.io>'
  },

  // Security
  security: {
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    sessionSecret: process.env.SESSION_SECRET,
    sessionCookieMaxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE) || 86400000,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  },

  // Features
  features: {
    aiCoach: process.env.FEATURE_AI_COACH !== 'false',
    adaptiveRAG: process.env.FEATURE_ADAPTIVE_RAG !== 'false',
    abTesting: process.env.FEATURE_AB_TESTING !== 'false',
    analytics: process.env.FEATURE_ANALYTICS !== 'false'
  },

  // Limits
  limits: {
    free: {
      postsPerMonth: parseInt(process.env.FREE_POSTS_PER_MONTH) || 10,
      aiCredits: parseInt(process.env.FREE_AI_CREDITS) || 50
    },
    pro: {
      postsPerMonth: parseInt(process.env.PRO_POSTS_PER_MONTH) || -1, // unlimited
      aiCredits: parseInt(process.env.PRO_AI_CREDITS) || 1000
    },
    creator: {
      postsPerMonth: parseInt(process.env.CREATOR_POSTS_PER_MONTH) || -1,
      aiCredits: parseInt(process.env.CREATOR_AI_CREDITS) || 5000
    },
    agency: {
      postsPerMonth: parseInt(process.env.AGENCY_POSTS_PER_MONTH) || -1,
      aiCredits: parseInt(process.env.AGENCY_AI_CREDITS) || 20000
    }
  }
}

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI'
]

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '))
  if (config.nodeEnv === 'production') {
    process.exit(1)
  }
}

// Warn about missing optional but recommended vars
const recommendedEnvVars = {
  'OPENAI_API_KEY': 'AI post generation will not work',
  'REDIS_URL': 'Caching and job queue will not work',
  'GOOGLE_CLIENT_ID': 'Google OAuth will not work',
  'LINKEDIN_AUTH_CLIENT_ID': 'LinkedIn OAuth will not work'
}

Object.entries(recommendedEnvVars).forEach(([key, message]) => {
  if (!process.env[key]) {
    console.warn(`⚠️  ${key} not set: ${message}`)
  }
})

module.exports = config
