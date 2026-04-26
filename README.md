# Osam Fits — Deployment Guide

## 🚀 Deploy to Vercel (Recommended — Free)

### Step 1: Create a Vercel Account
Go to **vercel.com** and sign up for free (use your email or Google account).

### Step 2: Install Vercel CLI (one time only)
You don't need this if you use the drag-and-drop method below.

### Step 3: Deploy via Drag & Drop
1. Go to **vercel.com/new**
2. Click **"Browse"** and select this entire `osam-fits` folder
3. Vercel detects it's a Vite/React app automatically
4. Click **Deploy**
5. In ~60 seconds you get a live link like: `osam-fits.vercel.app`

---

## 🔐 Admin Access
- Visit your live site and click **"Admin →"** in the top bar
- Default password: **osam2025**
- Change this in `src/App.jsx` — search for `osam2025` and replace with your own password

---

## ✏️ Self-Editing (No Code Needed)
Once live, go to your site → Admin → Settings to edit:
- Brand name, tagline, bio
- Services & pricing
- Collaborations
- Awards & press (add as you earn them)

All changes save automatically and appear live on your public profile.

---

## 🌐 Custom Domain (Optional)
1. Buy a domain (e.g. `osamfits.com`) from Namecheap or GoDaddy (~$10–15/year)
2. In Vercel dashboard → your project → Settings → Domains
3. Add your domain and follow the DNS instructions (takes ~5 minutes)

---

## 💻 Run Locally (Optional)
```bash
npm install
npm run dev
```
Then open http://localhost:5173 in your browser.

---

## 📦 Project Structure
```
osam-fits/
├── index.html          # App entry point
├── package.json        # Dependencies
├── vite.config.js      # Build config
├── vercel.json         # Vercel routing
├── public/
│   └── favicon.svg     # Brand icon
└── src/
    ├── main.jsx        # React entry
    └── App.jsx         # Full app (frontend + admin)
```

---

Built with React + Vite. Hosted on Vercel.
