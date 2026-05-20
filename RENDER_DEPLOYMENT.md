# Deploying to Render

## Prerequisites
- GitHub account (Render deploys from GitHub)
- Render account (free at https://render.com)

## Step 1: Push to GitHub

1. **Create a GitHub repository** for your project
2. **Initialize git** in your project folder:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/biens-artesania.git
   git push -u origin main
   ```

## Step 2: Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click **New +** → **PostgreSQL**
3. Fill in:
   - **Name**: `biens-artesania-db`
   - **Database**: `biens_artesania`
   - **User**: `admin`
   - **Region**: Choose closest to you (e.g., Oregon, N. California)
   - **Plan**: Free tier (good for testing)
4. Click **Create Database**
5. **Wait** 2-3 minutes for database to initialize
6. Copy the **External Database URL** (you'll need it)

## Step 3: Create Web Service on Render

1. Click **New +** → **Web Service**
2. **Connect GitHub**: Authorize and select your `biens-artesania` repository
3. Fill in:
   - **Name**: `biens-artesania`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free (with 0.5 CPU, 512MB RAM)
   - **Region**: Same as database
4. Click **Advanced** → **Add Environment Variable**
5. Add variables:
   - **Key**: `NODE_ENV` | **Value**: `production`
   - **Key**: `DATABASE_URL` | **Value**: *Paste the PostgreSQL URL from Step 2*
   - **Key**: `ADMIN_TOKEN` | **Value**: Your admin token (change the default!)
6. Click **Create Web Service**

## Step 4: Wait for Deployment

- Render will automatically:
  - Pull code from GitHub
  - Install dependencies (`npm install`)
  - Start your server (`node server.js`)
  - Initialize database tables
  - Seed sample products

- Check **Logs** tab to confirm success
- Your site will be available at: `https://biens-artesania.onrender.com`

## Step 5: Test Your Site

- Open: `https://biens-artesania.onrender.com`
- Browse products (from database)
- Test cart and checkout (saves to PostgreSQL)
- Check orders in admin panel

## Important Notes

### Free Tier Limitations
- **Spins down after 15 min of inactivity** (auto-wakes on request)
- **512MB RAM** (sufficient for this app)
- **10 GB PostgreSQL storage** (enough for thousands of orders)
- **100 GB/month bandwidth**

### Upgrading Later
- Click **Settings** → **Change Plan** to paid tier ($7+/month)
- Paid services stay always-on

## Auto-Deployment from GitHub

Every time you push to GitHub:
```powershell
git add .
git commit -m "Update message"
git push origin main
```

Render automatically redeploys! (Watch the **Deployments** tab)

## Database Backups

PostgreSQL data persists even if service stops. To backup:
1. Go to PostgreSQL database on Render
2. Download data or use `pg_dump` command

## Troubleshooting

### "Cannot GET /"
- Database not initialized yet (wait 2-3 min)
- Check logs for errors

### "DATABASE_URL not set"
- Verify DATABASE_URL environment variable exists
- Restart web service

### Slow startup
- Free tier has slower startup (normal)
- Can upgrade to paid for instant cold starts

## Next Steps

1. **Custom domain** (paid): Settings → Custom Domain
2. **SSL/HTTPS**: Automatic with Render
3. **Admin panel**: Use the admin dashboard to manage products
4. **Image storage**: Upload images → stored in PostgreSQL
