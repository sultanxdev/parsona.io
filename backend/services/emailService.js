const nodemailer = require('nodemailer')
const config = require('../config/env')

// Create transporter
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.pass
  }
})

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error)
  } else {
    console.log('✅ Email service is ready')
  }
})

// Send verification email
const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${config.frontendUrl}/verify-email/${token}`

  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: 'Verify Your Email - PersonaPilot',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to PersonaPilot! 🚀</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thanks for signing up! We're excited to have you on board.</p>
            <p>Please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} PersonaPilot. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('✅ Verification email sent to:', email)
  } catch (error) {
    console.error('❌ Error sending verification email:', error)
    throw error
  }
}

// Send password reset email
const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${config.frontendUrl}/reset-password/${token}`

  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: 'Reset Your Password - PersonaPilot',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request 🔐</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>We received a request to reset your password for your PersonaPilot account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Your password won't change until you create a new one</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} PersonaPilot. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('✅ Password reset email sent to:', email)
  } catch (error) {
    console.error('❌ Error sending password reset email:', error)
    throw error
  }
}

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: 'Welcome to PersonaPilot! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to PersonaPilot! 🎉</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Your account is now active! We're thrilled to have you join our community.</p>
            
            <h3>Here's what you can do now:</h3>
            
            <div class="feature">
              <strong>🎯 Complete Your Profile</strong>
              <p>Set up your persona and preferences to get personalized content suggestions.</p>
            </div>
            
            <div class="feature">
              <strong>📊 Discover Trends</strong>
              <p>Stay ahead with AI-powered trend analysis in your industry.</p>
            </div>
            
            <div class="feature">
              <strong>✍️ Generate Content</strong>
              <p>Create engaging posts with our AI-powered content generator.</p>
            </div>
            
            <div class="feature">
              <strong>📅 Schedule Posts</strong>
              <p>Plan and schedule your content across multiple platforms.</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${config.frontendUrl}/dashboard" class="button">Go to Dashboard</a>
            </div>
            
            <p>Need help getting started? Check out our <a href="${config.frontendUrl}/docs">documentation</a> or reach out to our support team.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} PersonaPilot. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('✅ Welcome email sent to:', email)
  } catch (error) {
    console.error('❌ Error sending welcome email:', error)
    throw error
  }
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
}
