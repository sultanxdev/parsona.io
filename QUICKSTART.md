# 🚀 Quick Start Guide

Get PersonaPilot up and running in 5 minutes!

## Prerequisites

- Node.js v16+ installed
- MongoDB running (local or Atlas)
- Gmail account for emails

## Step 1: Setup Environment

```bash
# Run the setup script
node setup.js
```

This will:
- Create `.env` file from template
- Generate secure JWT secrets automatically
- Show you what to configure next

## Step 2: Configure OAuth (Optional but Recommended)

### Google OAuth
1. Visit: https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add redirect URI: `http://localhost:5000/api/auth/google/callback`
4. Copy Client ID & Secret to `.env`

### LinkedIn OAuth
1. Visit: https://www.linkedin.com/developers/apps
2. Create new app
3. Add redirect URL: `http://localhost:5000/api/auth/linkedin/callback`
4. Copy Client ID & Secret to `.env`

### Gmail SMTP
1. Enable 2FA on Gmail
2. Visit: https://myaccount.google.com/apppasswords
3. Generate app password
4. Add to `.env` as `SMTP_PASS`

## Step 3: Install Dependencies

```bash
# Install all dependencies at once
npm run install:all

# Or install separately
cd backend && npm install
cd ../frontend && npm install
```

## Step 4: Configure MongoDB

Edit `.env` and set your MongoDB connection:

```env
MONGODB_URI=mongodb://localhost:27017/personapilot
# Or use MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/personapilot
```

## Step 5: Start the Application

Open two terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Step 6: Test It Out!

1. Open http://localhost:5173
2. Click "Sign Up"
3. Create an account with email or OAuth
4. Check your email for verification link
5. Login and explore!

## 🎯 What's Working Now

✅ Email/Password signup & login
✅ Google OAuth login
✅ LinkedIn OAuth login
✅ Email verification
✅ Password reset
✅ JWT authentication
✅ Token refresh
✅ Protected routes
✅ User profile management

## 🔧 Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify `.env` file exists
- Check port 5000 is available

### Frontend won't start
- Check port 5173 is available
- Clear node_modules and reinstall

### OAuth not working
- Verify callback URLs match exactly
- Check credentials in `.env`
- Ensure OAuth consent screen is configured

### Emails not sending
- Verify Gmail app password
- Check SMTP settings in `.env`
- Look for errors in backend console

## 📚 Next Steps

- Read full [README.md](README.md) for detailed docs
- Configure additional services (Redis, Cloudinary, etc.)
- Set up social media connections
- Deploy to production

## 🆘 Need Help?

- Check backend logs for errors
- Check frontend console for errors
- Review `.env.example` for correct format
- Create an issue on GitHub

## 🎉 You're All Set!

Your complete authentication system is ready. Start building your features!
