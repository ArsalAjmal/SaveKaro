# SaveKaro Deployment Guide

## 🚀 Deploying to Netlify (Frontend) & Render (Backend)

### Prerequisites
- GitHub account
- Netlify account (free tier)
- Render account (free tier)
- MongoDB Atlas account (free tier for database)

---

## Part 1: Setup MongoDB Atlas (Database)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Choose FREE tier (M0 Sandbox)

### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose "FREE" shared tier
3. Select cloud provider (AWS) and region (closest to you)
4. Click "Create Cluster"

### Step 3: Create Database User
1. Go to "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Set username: `savekaro_user`
5. Click "Autogenerate Secure Password" (SAVE THIS PASSWORD!)
6. Set role to "Atlas Admin"
7. Click "Add User"

### Step 4: Whitelist IP Addresses
1. Go to "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://savekaro_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with the password you saved earlier

---

## Part 2: Deploy Backend to Render

### Step 1: Prepare Backend for Deployment

1. Update `backend/main.py` to use environment variables:
```python
# Add at the top with other imports
import os
from fastapi.middleware.cors import CORSMiddleware

# Update the CORS middleware section
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-netlify-site.netlify.app",  # Update after deploying frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Update the server startup
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
```

### Step 2: Push Code to GitHub
```bash
cd /Users/apple/Documents/FWD_Project

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for deployment"

# Create repository on GitHub (do this on github.com)
# Then link and push:
git remote add origin https://github.com/YOUR_USERNAME/savekaro.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Render
1. Go to https://render.com
2. Sign up / Log in
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - **Name**: `savekaro-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: `Python 3`
   - **Build Command**: 
     ```bash
     cd backend && pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     cd backend && python main.py
     ```
   - **Instance Type**: Free

### Step 4: Add Environment Variables on Render
Click "Environment" tab and add these variables:

```
MONGODB_URL=mongodb+srv://savekaro_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/fwd_project?retryWrites=true&w=majority

SECRET_KEY=your-super-secret-key-change-this-to-something-random

EMAIL_ENABLED=true

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=arsal.ajmal621@gmail.com
SMTP_PASSWORD=your-app-password

EMAIL_FROM=SaveKaro <arsal.ajmal621@gmail.com>

PORT=8000
```

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Copy your backend URL: `https://savekaro-backend.onrender.com`

---

## Part 3: Deploy Frontend to Netlify

### Step 1: Update Frontend Configuration

1. Create `.env.production` file in frontend folder:
```bash
REACT_APP_API_URL=https://savekaro-backend.onrender.com
```

2. Update `frontend/src` files to use environment variable:
   - Search for `http://localhost:8000` in all frontend files
   - Replace with `${process.env.REACT_APP_API_URL}` or use a constant:

Create `frontend/src/config.js`:
```javascript
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

### Step 2: Build Frontend Locally (Optional - to test)
```bash
cd frontend
npm run build
```

### Step 3: Deploy on Netlify

#### Option A: Drag & Drop (Quick & Easy)
1. Go to https://app.netlify.com
2. Sign up / Log in
3. Drag the `frontend/build` folder to Netlify

#### Option B: Connect GitHub (Recommended)
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub"
4. Select your repository
5. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`
6. Click "Deploy site"

### Step 4: Add Environment Variables on Netlify
1. Go to Site settings → Environment variables
2. Add:
   ```
   REACT_APP_API_URL=https://savekaro-backend.onrender.com
   ```
3. Redeploy the site

### Step 5: Update Backend CORS
1. Go back to Render dashboard
2. Update `backend/main.py` CORS settings with your Netlify URL
3. Or add environment variable on Render:
   ```
   FRONTEND_URL=https://your-site-name.netlify.app
   ```

---

## Part 4: Final Configuration

### Step 1: Update Email Links
Update `backend/email_utils.py` to use production URLs:
```python
# In send_verification_email function
verification_link = f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token={token}"

# In send_password_reset_email function
reset_link = f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token={token}"
```

### Step 2: Custom Domain (Optional)
**On Netlify:**
1. Go to Domain settings
2. Add custom domain
3. Follow DNS configuration instructions

**On Render:**
1. Go to Settings → Custom Domains
2. Add your API subdomain (e.g., api.yourdomain.com)

---

## 🔍 Testing Deployment

### Test Backend:
```bash
curl https://savekaro-backend.onrender.com/api/products/
```

### Test Frontend:
1. Visit your Netlify URL
2. Browse products
3. Test signup/login
4. Test email verification
5. Test password reset
6. Test favorites
7. Test all features

---

## 🛠️ Troubleshooting

### Backend Issues:
- Check Render logs: Dashboard → Logs
- Verify environment variables are set
- Check MongoDB connection string

### Frontend Issues:
- Check Netlify deploy logs
- Verify `REACT_APP_API_URL` is set
- Check browser console for CORS errors

### Common Errors:
1. **CORS Error**: Update backend CORS settings with frontend URL
2. **MongoDB Connection**: Check connection string and IP whitelist
3. **Email Not Sending**: Verify SMTP credentials
4. **404 Errors**: Add `_redirects` file in `public` folder

---

## 📝 Important Notes

1. **Render Free Tier**: Backend spins down after 15 minutes of inactivity (cold start ~30 seconds)
2. **MongoDB Free Tier**: 512MB storage limit
3. **Netlify Free Tier**: 100GB bandwidth/month
4. **Environment Variables**: Never commit `.env` files to GitHub!
5. **Security**: Change SECRET_KEY to a random string
6. **Gmail SMTP**: May need to enable "Less secure app access" or use App Password

---

## 🎉 Your Site is Live!

**Frontend**: https://your-site-name.netlify.app  
**Backend**: https://savekaro-backend.onrender.com

Share your amazing Pakistani fashion deal aggregator with the world! 🚀

