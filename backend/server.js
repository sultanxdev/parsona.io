const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')

// Load environment variables from root .env file
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const config = require('./config/env')

const app = express()

// Security middleware
app.use(helmet())
app.use(cors({
  origin: config.security.corsOrigin,
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
})
app.use('/api/', limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Database connection
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB')
  console.log(`📊 Database: ${config.mongoUri.split('@')[1] || config.mongoUri}`)
  // Initialize scheduler service after database connection
  try {
    require('./services/schedulerService')
  } catch (error) {
    console.log('⚠️  Scheduler service not available')
  }
})
.catch(err => console.error('❌ MongoDB connection error:', err))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))
app.use('/api/trends', require('./routes/trends'))
app.use('/api/posts', require('./routes/posts'))
app.use('/api/analytics', require('./routes/analytics'))
app.use('/api/billing', require('./routes/billing'))
app.use('/api/connections', require('./routes/connections'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/docs', require('./routes/docs'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`)
  console.log(`📱 Environment: ${config.nodeEnv}`)
  console.log(`🌐 Frontend URL: ${config.frontendUrl}`)
  console.log(`🔐 JWT Expiry: ${config.jwt.expiresIn}`)
  console.log(`✅ Server ready!`)
})