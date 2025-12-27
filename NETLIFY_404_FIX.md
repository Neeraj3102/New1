# 🔧 Netlify 404 Error - Troubleshooting Guide

## Problem: "Page not found" after deployment

This happens when Netlify doesn't know to serve index.html for React Router routes.

## ✅ Solution Steps

### Step 1: Check Your Deploy Method

**If you used "Drag & Drop":**
- ❌ Problem: You might have dragged the wrong folder
- ✅ Solution: Make sure you dragged the `build` folder, not `frontend` folder

**If you used GitHub integration:**
- ❌ Problem: Build settings might be wrong
- ✅ Solution: Follow Step 2 below

### Step 2: Fix Build Settings (GitHub Deploy)

1. **Go to Netlify Dashboard**
   - Open your site
   - Click **Site configuration**

2. **Configure Build Settings**
   - Go to **Build & deploy** → **Build settings**
   - Click **Edit settings**
   
3. **Set These EXACT Values:**
   ```
   Base directory: (leave empty)
   Build command: yarn build
   Publish directory: build
   ```
   
4. **Save and Redeploy**
   - Go to **Deploys** tab
   - Click **Trigger deploy** → **Clear cache and deploy site**

### Step 3: Add Redirect Rule Manually

If the above doesn't work, add redirect manually:

1. **Go to Site configuration** → **Redirects and rewrites**
2. Click **Add redirect rule**
3. Enter:
   ```
   From: /*
   To: /index.html
   Status: 200 (Rewrite)
   ```
4. Click **Save**
5. Redeploy your site

### Step 4: Verify Files Are Deployed

1. Go to your Netlify site URL
2. Add `/_redirects` to the URL
   - Example: `https://your-site.netlify.app/_redirects`
3. You should see the redirect rules
4. If you see 404, the file wasn't included in build

### Step 5: Fresh Rebuild

If still not working:

1. **Local Machine:**
   ```bash
   cd frontend
   rm -rf build node_modules
   yarn install
   yarn build
   ```

2. **Check build folder:**
   ```bash
   ls build/
   ```
   - You should see `_redirects` file
   - You should see `index.html`

3. **Deploy the new build:**
   - Drag & drop the new `build` folder to Netlify
   - OR push to GitHub to trigger new deploy

## 🎯 Quick Test After Fix

After applying any fix:

1. Go to your Netlify URL (homepage)
   - Example: `https://your-site.netlify.app`
   - Should work ✅

2. Try a direct route:
   - Example: `https://your-site.netlify.app/daily-planner`
   - Should work ✅ (not 404)

3. Refresh any page:
   - Navigate to any page in your app
   - Hit refresh (F5)
   - Should work ✅ (not 404)

## 🔍 Common Issues

### Issue 1: Wrong Folder Deployed
**Symptom:** Nothing works, even homepage
**Fix:** Deploy the `build` folder, not `frontend` folder

### Issue 2: Build Settings Wrong
**Symptom:** GitHub deploy shows errors
**Fix:** Set publish directory to `build`

### Issue 3: _redirects Not Copying
**Symptom:** Homepage works, routes don't
**Fix:** Ensure `_redirects` is in `public/` folder before build

### Issue 4: Using npm Instead of yarn
**Symptom:** Build fails on Netlify
**Fix:** Change build command to `npm run build`

## 📸 What Success Looks Like

After fixing, you should see:

1. **Homepage loads:** `https://your-site.netlify.app/`
2. **All routes work:** `/daily-planner`, `/habit-tracker`, etc.
3. **Refresh works:** No 404 on refresh
4. **Navigation works:** All menu links work

## 🆘 Still Not Working?

If you've tried everything above:

### Option A: Start Fresh

1. **Delete the site** on Netlify
2. **Rebuild locally:**
   ```bash
   cd frontend
   yarn build
   ```
3. **Deploy fresh:**
   - Drag & drop `build` folder to https://app.netlify.com/drop

### Option B: Use Alternative Hosting

If Netlify continues to have issues:
- **Vercel:** Similar to Netlify, works great with React
- **GitHub Pages:** Free, but requires slight config changes
- **Cloudflare Pages:** Fast and reliable

## 📋 Deployment Checklist

Before deploying, verify:

- [ ] `_redirects` file exists in `public/` folder
- [ ] `netlify.toml` exists in root folder
- [ ] Build command is `yarn build` (or `npm run build`)
- [ ] Publish directory is `build`
- [ ] Build succeeds locally without errors
- [ ] `build/` folder contains `index.html` and `_redirects`

## 💡 Pro Tips

1. **Always test locally first:**
   ```bash
   yarn build
   npx serve -s build
   ```
   Open http://localhost:3000 and test all routes

2. **Check deploy logs:**
   - Netlify shows detailed logs
   - Look for errors during build
   - Verify files are being deployed

3. **Use deploy previews:**
   - Test before going live
   - Netlify creates preview URLs for each deploy

---

**Need more help?** Share:
1. Your Netlify site URL
2. Deploy log from Netlify
3. Screenshot of Build settings page
