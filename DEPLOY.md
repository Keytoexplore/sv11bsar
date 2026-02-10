# Deployment Guide

## Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js apps and offers generous free tier.

### Step-by-Step Instructions

1. **Sign up for Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Choose `Keytoexplore/sv11bsar`
   - Click "Import"

3. **Configure Environment Variables**
   - In the deployment settings, find "Environment Variables"
   - Add:
     ```
     Name: POKEMON_API_KEY
     Value: pokeprice_free_67abf1594acce302cdbaaf1339c9234cbc402f5726e95cd7
     ```
   - Make sure to select all environments (Production, Preview, Development)

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for the build to complete
   - Your dashboard will be live at `https://sv11bsar.vercel.app` (or similar)

5. **Custom Domain (Optional)**
   - In your Vercel project settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

### Automatic Deployments

After initial setup, every push to `main` branch will automatically deploy to production!

## Alternative: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) and sign up
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select `Keytoexplore/sv11bsar`
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add environment variable:
   - Key: `POKEMON_API_KEY`
   - Value: Your API key
6. Click "Deploy site"

## Local Development

1. Clone the repo:
   ```bash
   git clone https://github.com/Keytoexplore/sv11bsar.git
   cd sv11bsar
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

4. Add your API key to `.env.local`

5. Run development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:3000

## Production Build (Manual)

```bash
npm run build
npm start
```

## Troubleshooting

### "API key not found" error
- Make sure `POKEMON_API_KEY` is set in Vercel environment variables
- Redeploy after adding the variable

### Cards not loading
- Check if you've exceeded the daily API limit (100 credits/day on free plan)
- Wait 24 hours or upgrade your API plan

### Build fails
- Make sure all dependencies are installed: `npm install`
- Check Node.js version (should be 18+)

### Images not loading
- This is normal if the API is rate-limited
- Cards will show placeholder when images fail to load

## Monitoring

- Check Vercel deployment logs for errors
- Monitor API usage in your Pokemon Price Tracker dashboard
- Free plan: 100 credits/day should be enough for ~20-30 page views

## Support

For issues:
- Check the [README.md](./README.md)
- Open an issue on [GitHub](https://github.com/Keytoexplore/sv11bsar/issues)
