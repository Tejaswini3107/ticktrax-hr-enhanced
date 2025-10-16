# TickTrax Vercel Deployment Guide

## 🚀 Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from project directory**:
   ```bash
   cd "/Users/tejaswini/Downloads/Ticktrax 3"
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project? → No (for first deployment)
   - Project name → `ticktrax-app` (or your preferred name)
   - Directory → `./` (current directory)
   - Override settings? → No

5. **Production deployment**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Go to**: https://vercel.com/dashboard
2. **Click**: "New Project"
3. **Import Git Repository**: Connect your GitHub/GitLab repository
4. **Configure**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Option 3: Deploy via GitHub Integration

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to https://vercel.com/dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite configuration

## ⚙️ Configuration

### Environment Variables (if needed)
Add these in Vercel dashboard under Settings → Environment Variables:

```
NODE_ENV=production
VITE_API_BASE_URL=https://your-api-domain.com
```

### Build Settings
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 🔧 Pre-deployment Checklist

- ✅ **Build Test**: `npm run build` (should complete without errors)
- ✅ **Dependencies**: All packages installed
- ✅ **Mobile Components**: Excluded from web deployment
- ✅ **Console Logs**: Cleaned up
- ✅ **API Configuration**: Updated for production

## 📱 Application Features

### User Roles
- **Employee**: `employee@example.com` / `password123`
- **Manager**: `manager@example.com` / `password123`
- **HR**: `tehr@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`

### Key Features
- ✅ Role-based dashboards
- ✅ Clock in/out synchronization
- ✅ Time management
- ✅ Reports and analytics
- ✅ Mobile-responsive design
- ✅ Real-time updates

## 🌐 Post-Deployment

### Custom Domain (Optional)
1. Go to Vercel Dashboard → Project Settings
2. Click "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

### Monitoring
- **Analytics**: Available in Vercel dashboard
- **Logs**: Check function logs for any issues
- **Performance**: Monitor Core Web Vitals

## 🚨 Troubleshooting

### Build Failures
```bash
# Check build locally first
npm run build

# If issues, check:
npm install
npm run build
```

### API Issues
- Ensure API endpoints are accessible from Vercel
- Check CORS settings on your backend
- Verify environment variables are set

### Mobile Components
- Mobile components are excluded from web deployment
- Only web-optimized components are included

## 📊 Deployment Status

After deployment, you'll get:
- **Live URL**: `https://your-project.vercel.app`
- **Preview URLs**: For each deployment
- **Analytics**: Performance metrics
- **Logs**: Real-time application logs

## 🎯 Success Criteria

✅ **Application loads** without errors
✅ **All user roles** work correctly
✅ **Clock in/out** synchronization works
✅ **Responsive design** works on all devices
✅ **API calls** function properly
✅ **No console errors** in production

---

**🎉 Your TickTrax application will be live on Vercel!**
