const express = require('express')
const jwt = require('jsonwebtoken')
const axios = require('axios')
const crypto = require('crypto')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const Role = require('../models/Role')
const auth = require('../middleware/auth')
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService')

const router = express.Router()

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  })
}

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: '30d'
  })
}

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email'
      })
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    })

    await user.save()

    // Generate tokens
    const token = generateToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex')
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    await user.save()

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken)
    } catch (error) {
      console.error('Failed to send verification email:', error)
    }

    res.status(201).json({
      message: 'User created successfully. Please check your email to verify your account.',
      token,
      refreshToken,
      user: user.toJSON()
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({
      message: 'Server error during signup'
    })
  }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials'
      })
    }

    // Update last login
    user.lastLoginAt = new Date()
    await user.save()

    // Generate tokens
    const token = generateToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    res.json({
      message: 'Login successful',
      token,
      refreshToken,
      user: user.toJSON()
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      message: 'Server error during login'
    })
  }
})

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    res.json({
      user: user.toJSON()
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      message: 'Server error'
    })
  }
})

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token using refresh token
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        message: 'Refresh token is required'
      })
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)
    
    // Get user
    const user = await User.findById(decoded.userId)
    if (!user || !user.isActive) {
      return res.status(401).json({
        message: 'Invalid refresh token'
      })
    }

    // Generate new tokens
    const newToken = generateToken(user._id)
    const newRefreshToken = generateRefreshToken(user._id)
    
    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
      message: 'Token refreshed successfully'
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(401).json({
      message: 'Invalid or expired refresh token'
    })
  }
})

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, (req, res) => {
  res.json({
    message: 'Logout successful'
  })
})

// @route   GET /api/auth/verify-email/:token
// @desc    Verify user email
// @access  Public
router.get('/verify-email/:token', async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired verification token'
      })
    }

    user.emailVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationExpires = undefined
    await user.save()

    res.json({
      message: 'Email verified successfully',
      user: user.toJSON()
    })
  } catch (error) {
    console.error('Email verification error:', error)
    res.status(500).json({
      message: 'Server error during email verification'
    })
  }
})

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Private
router.post('/resend-verification', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (user.emailVerified) {
      return res.status(400).json({
        message: 'Email is already verified'
      })
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex')
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000
    await user.save()

    // Send verification email
    await sendVerificationEmail(user.email, user.name, verificationToken)

    res.json({
      message: 'Verification email sent successfully'
    })
  } catch (error) {
    console.error('Resend verification error:', error)
    res.status(500).json({
      message: 'Server error sending verification email'
    })
  }
})

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email } = req.body
    const user = await User.findOne({ email })

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        message: 'If an account exists with this email, a password reset link has been sent'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000 // 1 hour
    await user.save()

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken)
    } catch (error) {
      console.error('Failed to send password reset email:', error)
      user.passwordResetToken = undefined
      user.passwordResetExpires = undefined
      await user.save()
      
      return res.status(500).json({
        message: 'Error sending password reset email'
      })
    }

    res.json({
      message: 'If an account exists with this email, a password reset link has been sent'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({
      message: 'Server error processing password reset request'
    })
  }
})

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.post('/reset-password/:token', [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired reset token'
      })
    }

    // Set new password
    user.password = req.body.password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    user.passwordChangedAt = Date.now()
    await user.save()

    // Generate new tokens
    const token = generateToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    res.json({
      message: 'Password reset successful',
      token,
      refreshToken,
      user: user.toJSON()
    })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({
      message: 'Server error resetting password'
    })
  }
})

// @route   POST /api/auth/change-password
// @desc    Change password (when logged in)
// @access  Private
router.post('/change-password', auth, [
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id)

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({
        message: 'Current password is incorrect'
      })
    }

    // Set new password
    user.password = newPassword
    user.passwordChangedAt = Date.now()
    await user.save()

    // Generate new tokens
    const token = generateToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    res.json({
      message: 'Password changed successfully',
      token,
      refreshToken
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      message: 'Server error changing password'
    })
  }
})

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', auth, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { name, email, avatar } = req.body
    const user = await User.findById(req.user._id)

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({
          message: 'Email is already in use'
        })
      }
      user.email = email
      user.emailVerified = false // Require re-verification
      
      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex')
      user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex')
      user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000
      
      try {
        await sendVerificationEmail(email, name || user.name, verificationToken)
      } catch (error) {
        console.error('Failed to send verification email:', error)
      }
    }

    if (name) user.name = name
    if (avatar) user.avatar = avatar

    await user.save()

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      message: 'Server error updating profile'
    })
  }
})

// @route   DELETE /api/auth/delete-account
// @desc    Delete user account
// @access  Private
router.delete('/delete-account', auth, [
  body('password').exists().withMessage('Password is required to delete account')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const user = await User.findById(req.user._id)

    // Verify password
    if (user.password) {
      const isMatch = await user.comparePassword(req.body.password)
      if (!isMatch) {
        return res.status(401).json({
          message: 'Incorrect password'
        })
      }
    }

    // Soft delete - deactivate account
    user.isActive = false
    user.deletedAt = Date.now()
    await user.save()

    // Could also delete related data here (posts, roles, etc.)

    res.json({
      message: 'Account deleted successfully'
    })
  } catch (error) {
    console.error('Delete account error:', error)
    res.status(500).json({
      message: 'Server error deleting account'
    })
  }
})

// @route   GET /api/auth/google
// @desc    Google OAuth login
// @access  Public
router.get('/google', (req, res) => {
  // Google OAuth redirect URL
  const googleAuthUrl = `https://accounts.google.com/oauth/authorize?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&scope=openid%20profile%20email&response_type=code`
  res.redirect(googleAuthUrl)
})

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query
    
    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`)
    }
    
    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.GOOGLE_CALLBACK_URL
    })

    const { access_token } = tokenResponse.data

    // Get user info from Google
    const userResponse = await axios.get(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`)
    const { id, email, name, picture } = userResponse.data

    // Check if user exists by googleId or email
    let user = await User.findOne({ 
      $or: [{ googleId: id }, { email }] 
    })
    
    if (!user) {
      // Create new user
      user = new User({
        googleId: id,
        name,
        email,
        avatar: picture,
        emailVerified: true, // Google emails are pre-verified
        onboardingCompleted: false
      })
      await user.save()

      // Send welcome email
      try {
        const { sendWelcomeEmail } = require('../services/emailService')
        await sendWelcomeEmail(email, name)
      } catch (error) {
        console.error('Failed to send welcome email:', error)
      }
    } else if (!user.googleId) {
      // Link Google account to existing user
      user.googleId = id
      user.emailVerified = true
      if (!user.avatar) user.avatar = picture
      await user.save()
    }

    // Update last login
    user.lastLoginAt = new Date()
    await user.save()

    // Generate JWT tokens
    const token = generateToken(user._id)
    const refreshToken = generateRefreshToken(user._id)
    
    // Redirect to frontend with tokens
    const redirectUrl = user.onboardingCompleted 
      ? `${process.env.FRONTEND_URL}/dashboard?token=${token}&refreshToken=${refreshToken}`
      : `${process.env.FRONTEND_URL}/onboarding?token=${token}&refreshToken=${refreshToken}`
      
    res.redirect(redirectUrl)
  } catch (error) {
    console.error('Google OAuth error:', error)
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`)
  }
})

// @route   GET /api/auth/linkedin
// @desc    LinkedIn OAuth login
// @access  Public
router.get('/linkedin', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex')
  const scope = 'openid profile email'
  
  const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_AUTH_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.LINKEDIN_AUTH_CALLBACK_URL)}&state=${state}&scope=${encodeURIComponent(scope)}`
  
  res.redirect(linkedinAuthUrl)
})

// @route   GET /api/auth/linkedin/callback
// @desc    LinkedIn OAuth callback
// @access  Public
router.get('/linkedin/callback', async (req, res) => {
  try {
    const { code, state } = req.query
    
    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`)
    }

    // Exchange code for access token
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        client_id: process.env.LINKEDIN_AUTH_CLIENT_ID,
        client_secret: process.env.LINKEDIN_AUTH_CLIENT_SECRET,
        redirect_uri: process.env.LINKEDIN_AUTH_CALLBACK_URL
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    const { access_token } = tokenResponse.data

    // Get user profile
    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    })

    const { sub: linkedinId, email, name, picture } = profileResponse.data

    // Check if user exists by linkedinId or email
    let user = await User.findOne({ 
      $or: [{ linkedinId }, { email }] 
    })
    
    if (!user) {
      // Create new user
      user = new User({
        linkedinId,
        name,
        email,
        avatar: picture,
        emailVerified: true, // LinkedIn emails are pre-verified
        onboardingCompleted: false
      })
      await user.save()

      // Send welcome email
      try {
        const { sendWelcomeEmail } = require('../services/emailService')
        await sendWelcomeEmail(email, name)
      } catch (error) {
        console.error('Failed to send welcome email:', error)
      }
    } else if (!user.linkedinId) {
      // Link LinkedIn account to existing user
      user.linkedinId = linkedinId
      user.emailVerified = true
      if (!user.avatar) user.avatar = picture
      await user.save()
    }

    // Update last login
    user.lastLoginAt = new Date()
    await user.save()

    // Generate JWT tokens
    const token = generateToken(user._id)
    const refreshToken = generateRefreshToken(user._id)
    
    // Redirect to frontend with tokens
    const redirectUrl = user.onboardingCompleted 
      ? `${process.env.FRONTEND_URL}/dashboard?token=${token}&refreshToken=${refreshToken}`
      : `${process.env.FRONTEND_URL}/onboarding?token=${token}&refreshToken=${refreshToken}`
      
    res.redirect(redirectUrl)
  } catch (error) {
    console.error('LinkedIn OAuth error:', error.response?.data || error)
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`)
  }
})

// @route   POST /api/auth/complete-onboarding
// @desc    Complete user onboarding with persona setup
// @access  Private
router.post('/complete-onboarding', auth, [
  body('role').isString().withMessage('Role is required'),
  body('industry').isString().withMessage('Industry is required'),
  body('experienceLevel').isString().withMessage('Experience level is required'),
  body('brandingGoal').isString().withMessage('Branding goal is required'),
  body('tone').isString().withMessage('Tone is required'),
  body('topicsKeywords').isArray().withMessage('Topics and keywords must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { role, industry, experienceLevel, brandingGoal, tone, topicsKeywords } = req.body
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    // Create primary role/persona
    const primaryRole = new Role({
      user: user._id,
      name: `${role} - ${industry}`,
      description: `${role} focused on ${brandingGoal.toLowerCase()} in ${industry}`,
      persona: {
        industry: industry.toLowerCase(),
        targetAudience: getTargetAudience(role, industry),
        toneOfVoice: tone.toLowerCase(),
        contentTypes: getContentTypes(brandingGoal),
        keywords: topicsKeywords,
        hashtags: generateHashtags(topicsKeywords),
        brandingGoal,
        experienceLevel
      },
      isDefault: true,
      isActive: true
    })

    await primaryRole.save()

    // Generate AI persona audit
    const personaAudit = await generatePersonaAudit(user, primaryRole)

    // Update user onboarding status
    user.onboardingCompleted = true
    user.onboardingStep = 5
    await user.save()

    res.json({
      message: 'Onboarding completed successfully',
      user: user.toJSON(),
      primaryRole,
      personaAudit
    })
  } catch (error) {
    console.error('Onboarding error:', error)
    res.status(500).json({
      message: 'Server error during onboarding'
    })
  }
})

// Helper functions for onboarding
function getTargetAudience(role, industry) {
  const audiences = {
    'Student': 'fellow students and entry-level professionals',
    'Developer': 'tech professionals and hiring managers',
    'Creator': 'content consumers and brand collaborators',
    'Professional': 'industry peers and potential clients'
  }
  return audiences[role] || 'professionals in ' + industry
}

function getContentTypes(brandingGoal) {
  const contentMap = {
    'Job Offers': ['professional', 'educational', 'personal'],
    'Thought Leadership': ['educational', 'opinion', 'insights'],
    'Audience Growth': ['entertaining', 'educational', 'engaging']
  }
  return contentMap[brandingGoal] || ['professional', 'educational']
}

function generateHashtags(keywords) {
  return keywords.slice(0, 5).map(keyword => 
    keyword.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')
  )
}

async function generatePersonaAudit(user, role) {
  // This would integrate with AI service for persona audit
  return {
    personaScore: 65, // Initial score
    suggestedBio: `${role.persona.experienceLevel} ${user.name.split(' ')[0]} | ${role.persona.industry} enthusiast | Sharing insights on ${role.persona.keywords.slice(0, 3).join(', ')}`,
    starterPosts: [
      {
        type: 'introduction',
        content: `👋 Hi! I'm ${user.name.split(' ')[0]}, a ${role.persona.experienceLevel.toLowerCase()} ${role.name.split(' - ')[0].toLowerCase()} passionate about ${role.persona.keywords[0]}. Excited to share my journey and connect with like-minded professionals!`
      },
      {
        type: 'insight',
        content: `💡 Key insight from my ${role.persona.industry} experience: ${role.persona.keywords[0]} is transforming how we work. Here's what I've learned...`
      },
      {
        type: 'engagement',
        content: `🤔 Question for the ${role.persona.industry} community: What's the biggest challenge you're facing with ${role.persona.keywords[0]}? Let's discuss solutions!`
      }
    ]
  }
}

module.exports = router