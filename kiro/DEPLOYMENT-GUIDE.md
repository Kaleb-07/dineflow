# 🚀 DineFlow Deployment Guide

## Quick Deploy (15 Minutes Total)

### Prerequisites
- GitHub account (you already have this)
- Vercel account (free - sign up with GitHub)
- Railway account (free - sign up with GitHub)

---

## Part 1: Deploy Backend (10 minutes)

### Step 1: Sign up for Railway
1. Go to https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your `dineflow` repository
4. Railway will detect it's a Node.js app

### Step 3: Configure Backend
1. Click on your service
2. Go to "Settings" tab
3. Set **Root Directory**: `dineflow/backend`
4. Set **Start Command**: `npm start`

### Step 4: Add MySQL Database
1. Click "New" → "Database" → "Add MySQL"
2. Railway will create a MySQL instance
3. Copy the connection string

### Step 5: Set Environment Variables
1. Go to "Variables" tab
2. Add these variables:
   ```
   DATABASE_URL=<paste MySQL connection string from Railway>
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   NODE_ENV=production
   ```

### Step 6: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Copy your backend URL (looks like: `https://dineflow-backend-production.up.railway.app`)

### Step 7: Initialize Database
1. Go to Railway dashboard
2. Click on your backend service
3. Click "Settings" → "Deploy Logs"
4. Once deployed, run migrations:
   - In your local terminal:
   ```bash
   cd dineflow/backend
   # Update .env with production DATABASE_URL
   npx prisma db push
   node src/seed.js
   ```

---

## Part 2: Deploy Frontend (5 minutes)

### Step 1: Sign up for Vercel
1. Go to https://vercel.com
2. Click "Sign Up" → "Continue with GitHub"
3. Authorize Vercel

### Step 2: Import Project
1. Click "Add New..." → "Project"
2. Import your `dineflow` repository
3. Vercel will detect it's a Vite app

### Step 3: Configure Frontend
1. **Root Directory**: `dineflow/frontend`
2. **Framework Preset**: Vite
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`

### Step 4: Set Environment Variable
1. Click "Environment Variables"
2. Add:
   ```
   VITE_API_URL=https://your-railway-backend-url.up.railway.app/api
   ```
   (Replace with your actual Railway backend URL)

### Step 5: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Your app will be live at: `https://dineflow.vercel.app`

---

## Part 3: Test Production Deployment

### Test Backend
```bash
# Test health endpoint
curl https://your-railway-backend-url.up.railway.app/api/health

# Should return: {"status":"ok"}
```

### Test Frontend
1. Open your Vercel URL in browser
2. Try to login with demo credentials:
   - Email: `admin@bellavista.et`
   - Password: `admin123`
3. Navigate to admin dashboard
4. Try creating a new menu item
5. Visit guest menu: `https://dineflow.vercel.app/menu/bella-vista`

---

## Part 4: Custom Domain (Optional)

### For Frontend (Vercel)
1. Buy domain from Namecheap/GoDaddy (e.g., `dineflow.et`)
2. In Vercel dashboard:
   - Go to "Settings" → "Domains"
   - Add your domain
   - Follow DNS configuration instructions
3. Your app will be at: `https://dineflow.et`

### For Backend (Railway)
1. In Railway dashboard:
   - Go to "Settings" → "Domains"
   - Add custom domain (e.g., `api.dineflow.et`)
   - Update DNS records
2. Update frontend env: `VITE_API_URL=https://api.dineflow.et/api`

---

## Alternative Deployment Options

### Option 2: Netlify + Render

**Frontend (Netlify):**
1. Go to https://netlify.com
2. Drag and drop `dineflow/frontend/dist` folder
3. Set environment variables
4. Done!

**Backend (Render):**
1. Go to https://render.com
2. Create "New Web Service"
3. Connect GitHub repo
4. Set root directory: `dineflow/backend`
5. Add MySQL database
6. Deploy

### Option 3: DigitalOcean App Platform

**All-in-one deployment:**
1. Go to https://digitalocean.com
2. Create "App"
3. Connect GitHub
4. Add both frontend and backend components
5. Add managed MySQL database
6. Deploy

**Cost:** ~$12/month for everything

---

## Environment Variables Reference

### Backend (.env)
```env
DATABASE_URL="mysql://user:password@host:port/database"
JWT_SECRET="your-super-secret-key-min-32-characters"
PORT=5000
NODE_ENV=production
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.com/api
```

---

## Troubleshooting

### Backend Issues

**Error: "Can't connect to database"**
- Check DATABASE_URL is correct
- Verify MySQL is running on Railway
- Check connection string format

**Error: "Module not found"**
- Make sure `npm install` ran successfully
- Check package.json is in root directory
- Verify start command is correct

**Error: "Port already in use"**
- Railway assigns port automatically
- Don't hardcode PORT in code
- Use `process.env.PORT || 5000`

### Frontend Issues

**Error: "Network Error" when calling API**
- Check VITE_API_URL is set correctly
- Verify backend is deployed and running
- Check CORS settings in backend

**Error: "Failed to fetch"**
- Backend might be sleeping (Railway free tier)
- Wait 30 seconds and try again
- Check backend logs in Railway

**Blank page after deployment**
- Check browser console for errors
- Verify build completed successfully
- Check environment variables are set

---

## Post-Deployment Checklist

- [ ] Backend health endpoint returns 200
- [ ] Frontend loads without errors
- [ ] Can login with demo credentials
- [ ] Can create new menu item
- [ ] Guest menu displays correctly
- [ ] QR codes generate properly
- [ ] Theme changes apply
- [ ] Reviews can be submitted
- [ ] Images upload successfully

---

## Monitoring & Maintenance

### Check These Daily:
1. **Uptime**: Visit your site once a day
2. **Logs**: Check Railway/Vercel logs for errors
3. **Database**: Monitor database size (free tier limits)

### Weekly Tasks:
1. **Backup database**: Export from Railway dashboard
2. **Check performance**: Use Vercel analytics
3. **Review errors**: Fix any recurring issues

### Monthly Tasks:
1. **Update dependencies**: `npm update`
2. **Security patches**: Check for vulnerabilities
3. **Cost review**: Monitor Railway/Vercel usage

---

## Scaling Considerations

### When you hit 50 customers:
- Upgrade Railway to Pro ($20/month)
- Add Redis for caching
- Enable CDN for images
- Set up monitoring (Sentry)

### When you hit 100 customers:
- Move to dedicated server (DigitalOcean Droplet)
- Set up load balancer
- Add database replicas
- Implement queue system (Bull/Redis)

### When you hit 500 customers:
- Kubernetes cluster
- Microservices architecture
- Dedicated DevOps engineer
- 24/7 monitoring

**But don't worry about this now. Focus on getting your first 10 customers!**

---

## Cost Breakdown

### Free Tier (0-10 customers):
- Railway: Free (500 hours/month)
- Vercel: Free (100GB bandwidth)
- **Total: 0 ETB/month**

### Paid Tier (10-50 customers):
- Railway Pro: $20/month (~1,000 ETB)
- Vercel Pro: $20/month (~1,000 ETB)
- Domain: $15/year (~60 ETB/month)
- **Total: ~2,060 ETB/month**

### Revenue at 10 customers:
- 10 × 1,500 ETB = 15,000 ETB/month
- Costs: 2,060 ETB/month
- **Profit: 12,940 ETB/month**

**Your costs are less than 15% of revenue. That's excellent!**

---

## Security Checklist

Before going live:
- [ ] Change JWT_SECRET to strong random string
- [ ] Enable HTTPS (automatic on Vercel/Railway)
- [ ] Set secure cookie flags
- [ ] Add rate limiting
- [ ] Validate all user inputs
- [ ] Sanitize database queries (Prisma does this)
- [ ] Add CORS whitelist
- [ ] Enable SQL injection protection (Prisma does this)
- [ ] Set up error logging (Sentry)
- [ ] Create backup strategy

---

## Support Resources

### Railway:
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

### Vercel:
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord
- Status: https://vercel-status.com

### General:
- Stack Overflow
- GitHub Issues
- Dev.to community

---

## 🎉 You're Ready!

Once deployed, your app will be:
- ✅ Live 24/7
- ✅ Accessible from anywhere
- ✅ Automatically scaled
- ✅ Backed up daily
- ✅ SSL secured

**Now go deploy and start selling! 🚀**
