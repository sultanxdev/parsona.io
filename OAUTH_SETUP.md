# 🔐 OAuth Setup Guide

Complete guide to setting up Google and LinkedIn OAuth authentication.

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "PersonaPilot"
4. Click "Create"

### Step 2: Enable Google+ API

1. In the left sidebar, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" (or "Internal" if using Google Workspace)
3. Click "Create"
4. Fill in the required fields:
   - **App name**: PersonaPilot
   - **User support email**: Your email
   - **Developer contact**: Your email
5. Click "Save and Continue"
6. Skip "Scopes" for now (click "Save and Continue")
7. Add test users if needed
8. Click "Save and Continue"

### Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Configure:
   - **Name**: PersonaPilot Web Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:5173`
     - `http://localhost:5000`
   - **Authorized redirect URIs**:
     - `http://localhost:5000/api/auth/google/callback`
5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

### Step 5: Add to .env

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### Step 6: Update for Production

When deploying to production:

1. Go back to OAuth credentials
2. Add production URLs:
   - **Authorized JavaScript origins**: `https://yourdomain.com`
   - **Authorized redirect URIs**: `https://api.yourdomain.com/api/auth/google/callback`
3. Update `.env` with production URLs

---

## LinkedIn OAuth Setup

### Step 1: Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click "Create app"
3. Fill in the form:
   - **App name**: PersonaPilot
   - **LinkedIn Page**: Select or create a page
   - **App logo**: Upload your logo
   - **Legal agreement**: Check the box
4. Click "Create app"

### Step 2: Configure App Settings

1. Go to "Settings" tab
2. Note your **Client ID** and **Client Secret**
3. Go to "Auth" tab
4. Add **Redirect URLs**:
   - `http://localhost:5000/api/auth/linkedin/callback`
5. Click "Update"

### Step 3: Request API Access

1. Go to "Products" tab
2. Find "Sign In with LinkedIn using OpenID Connect"
3. Click "Request access"
4. Wait for approval (usually instant for development)

### Step 4: Configure Scopes

The app automatically requests these scopes:
- `openid` - Basic authentication
- `profile` - User's profile information
- `email` - User's email address

### Step 5: Add to .env

```env
LINKEDIN_AUTH_CLIENT_ID=your-client-id-here
LINKEDIN_AUTH_CLIENT_SECRET=your-client-secret-here
LINKEDIN_AUTH_CALLBACK_URL=http://localhost:5000/api/auth/linkedin/callback
```

### Step 6: Update for Production

When deploying:

1. Go back to LinkedIn app settings
2. Add production redirect URL:
   - `https://api.yourdomain.com/api/auth/linkedin/callback`
3. Update `.env` with production URL

---

## Testing OAuth

### Test Google OAuth

1. Start your backend and frontend
2. Go to http://localhost:5173/login
3. Click "Continue with Google"
4. Select your Google account
5. Grant permissions
6. You should be redirected back and logged in

### Test LinkedIn OAuth

1. Go to http://localhost:5173/login
2. Click "Continue with LinkedIn"
3. Enter LinkedIn credentials
4. Grant permissions
5. You should be redirected back and logged in

---

## Common Issues & Solutions

### Google OAuth Issues

**Error: redirect_uri_mismatch**
- Solution: Ensure redirect URI in Google Console exactly matches the one in your `.env`
- Check for trailing slashes
- Verify http vs https

**Error: invalid_client**
- Solution: Double-check Client ID and Secret in `.env`
- Ensure no extra spaces or quotes

**Error: access_denied**
- Solution: User cancelled or app not verified
- Add test users in OAuth consent screen

### LinkedIn OAuth Issues

**Error: invalid_redirect_uri**
- Solution: Add redirect URI in LinkedIn app settings
- Must match exactly with `.env` configuration

**Error: unauthorized_client**
- Solution: Ensure "Sign In with LinkedIn" product is approved
- Check Client ID and Secret are correct

**Error: invalid_scope**
- Solution: Verify app has access to required scopes
- Request access to OpenID Connect product

---

## Security Best Practices

### Development
- Use `http://localhost` for local development
- Keep credentials in `.env` file
- Never commit `.env` to version control

### Production
- Always use `https://` URLs
- Store credentials in environment variables
- Use different OAuth apps for dev/staging/prod
- Regularly rotate client secrets
- Monitor OAuth usage in provider dashboards

### User Privacy
- Only request necessary scopes
- Clearly explain what data you're accessing
- Provide privacy policy link
- Allow users to disconnect OAuth accounts

---

## OAuth Flow Diagram

```
User clicks "Sign in with Google/LinkedIn"
           ↓
Redirect to OAuth provider
           ↓
User grants permissions
           ↓
Provider redirects to callback URL with code
           ↓
Backend exchanges code for access token
           ↓
Backend fetches user profile
           ↓
Backend creates/updates user in database
           ↓
Backend generates JWT tokens
           ↓
Frontend receives tokens and logs in user
```

---

## Additional Resources

### Google OAuth
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OAuth Playground](https://developers.google.com/oauthplayground/)
- [Google Cloud Console](https://console.cloud.google.com/)

### LinkedIn OAuth
- [LinkedIn OAuth Documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
- [API Documentation](https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api)

---

## Need Help?

If you're stuck:
1. Check the error message in browser console
2. Check backend logs for detailed errors
3. Verify all URLs match exactly
4. Ensure OAuth apps are properly configured
5. Create an issue on GitHub with error details
