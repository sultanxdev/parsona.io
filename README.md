# PersonaPilot - Complete Authentication System

AI-Powered Personal Branding Platform with complete authentication system including Google & LinkedIn OAuth, email verification, password reset, and more.

## 🚀 Features

### Authentication
- ✅ **Email/Password Authentication** - Traditional signup/login
- ✅ **Google OAuth** - Sign in with Google
- ✅ **LinkedIn OAuth** - Sign in with LinkedIn
- ✅ **Email Verification** - Verify user emails
- ✅ **Password Reset** - Forgot password functionality
- ✅ **JWT Tokens** - Access & refresh token system
- ✅ **Session Management** - Secure session handling
- ✅ **Account Management** - Update profile, change password, delete account

### Security
- 🔒 Rate limiting on API endpoints
- 🔒 Password hashing with bcrypt
- 🔒 JWT token expiration & refresh
- 🔒 CORS protection
- 🔒 Helmet security headers
- 🔒 Input validation & sanitization

## 📁 Project Structure

```
personapilot/
├── .env                          # Global environment configuration
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── README.md                     # This file
│
├── backend/
│   ├── config/
│   │   └── env.js               # Environment config loader
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   ├── User.js              # User model with OAuth support
│   │   ├── Role.js              # Role/Persona model
│   │   ├── Post.js              # Post model
│   │   └── Trend.js             # Trend model
│   ├── routes/
│   │   ├── auth.js              # Complete auth routes
│   │   ├── users.js             # User management routes
│   │   ├── posts.js             # Post routes
│   │   ├── trends.js            # Trend routes
│   │   ├── analytics.js         # Analytics routes
│   │   ├── billing.js           # Billing routes
│   │   ├── connections.js       # Social media connections
│   │   └── admin.js             # Admin routes
│   ├── services/
│   │   ├── emailService.js      # Email sending service
│   │   └── schedulerService.js  # Cron jobs
│   ├── server.js                # Express server
│   └── package.json             # Backend dependencies
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   │   └── ProtectedRoute.jsx
    │   │   ├── layout/
    │   │   └── ui/
    │   ├── config/
    │   │   └── env.js           # Frontend config
    │   ├── contexts/
    │   │   ├── AuthContext.jsx  # Auth state management
    │   │   └── ThemeContext.jsx
    │   ├── lib/
    │   │   └── axios.js         # Axios instance with interceptors
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── LoginPage.jsx
    │   │   │   ├── SignupPage.jsx
    │   │   │   ├── ForgotPasswordPage.jsx
    │   │   │   ├── ResetPasswordPage.jsx
    │   │   │   └── OnboardingPage.jsx
    │   │   └── dashboard/
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json             # Frontend dependencies

```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Gmail account (for email service)
- Google Cloud Console account (for OAuth)
- LinkedIn Developer account (for OAuth)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

### 3. Configure OAuth Providers

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Secret to `.env`

#### LinkedIn OAuth Setup
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create a new app
3. Add redirect URL: `http://localhost:5000/api/auth/linkedin/callback`
4. Request access to Sign In with LinkedIn
5. Copy Client ID and Secret to `.env`

#### Gmail SMTP Setup
1. Enable 2-Factor Authentication on your Gmail
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password
4. Add to `.env` as `SMTP_PASS`

### 4. Generate Secure Secrets

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add the generated secrets to `.env`:
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `SESSION_SECRET`

### 5. Start MongoDB

```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
```

### 6. Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Backend: http://localhost:5000
Frontend: http://localhost:5173

## 🔐 Authentication Endpoints

### Public Routes
- `POST /api/auth/signup` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/linkedin` - LinkedIn OAuth login
- `GET /api/auth/linkedin/callback` - LinkedIn OAuth callback
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/verify-email/:token` - Verify email

### Protected Routes
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/change-password` - Change password
- `PUT /api/auth/update-profile` - Update profile
- `POST /api/auth/resend-verification` - Resend verification email
- `DELETE /api/auth/delete-account` - Delete account

## 📧 Email Templates

The system includes beautiful HTML email templates for:
- Welcome emails
- Email verification
- Password reset
- Account notifications

## 🔄 Token Management

- **Access Token**: Short-lived (15 minutes) for API requests
- **Refresh Token**: Long-lived (30 days) for getting new access tokens
- Automatic token refresh on 401 errors
- Secure token storage in localStorage

## 🛡️ Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token expiration
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation with express-validator
- SQL injection prevention
- XSS protection

## 📱 Frontend Features

- Responsive design
- Dark/Light theme support
- Toast notifications
- Loading states
- Error handling
- Protected routes
- OAuth integration
- Form validation

## 🚀 Deployment

### Backend (Heroku/Railway/Render)
1. Set all environment variables
2. Update `FRONTEND_URL` to production URL
3. Update OAuth callback URLs
4. Deploy

### Frontend (Vercel/Netlify)
1. Set `VITE_API_URL` to backend URL
2. Update OAuth redirect URLs
3. Deploy

## 📝 Environment Variables Reference

See `.env.example` for complete list with descriptions.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@personapilot.io

## 🎉 Credits

Built with:
- Express.js
- React + Vite
- MongoDB
- JWT
- Nodemailer
- Axios
- TailwindCSS
