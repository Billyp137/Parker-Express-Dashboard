# Parker Express Client Dashboard
### Deployment Guide — Step by Step

---

## What you're deploying
A client-facing shipment dashboard at `dashboard.parkerexpress.com.au`.
Each client gets a unique private link that shows only their data from Starshipit.

---

## Step 1 — Upload code to GitHub

1. Go to **github.com** and click **New repository**
2. Name it `parker-express-dashboard`
3. Set it to **Private**, click **Create repository**
4. On the next screen, click **uploading an existing file**
5. Drag and drop ALL files from this folder into the upload area
6. Click **Commit changes**

---

## Step 2 — Deploy to Vercel

1. Go to **vercel.com** and click **Add New Project**
2. Click **Import** next to your `parker-express-dashboard` repo
3. Leave all settings as default — Vercel auto-detects Vite
4. Click **Deploy**
5. Wait ~60 seconds — your app is now live at a `vercel.app` URL

---

## Step 3 — Add your Environment Variables

This is how API keys are kept secure — they live in Vercel, never in the code.

1. In Vercel, go to your project → **Settings** → **Environment Variables**
2. Add these variables one by one:

| Name | Value |
|------|-------|
| `STARSHIPIT_SUBSCRIPTION_KEY` | Your Starshipit Ocp-Apim subscription key |
| `VITE_ADMIN_PIN` | A PIN of your choice for the admin panel |

3. For each client's API key, add a variable in this format:
   - Go to your Admin panel (step 5 below) first to get each client's token
   - Then add: `PX_APIKEY_<TOKEN_UPPERCASED>` = their Starshipit child API key
   - Example: `PX_APIKEY_MAPLE_AB1234` = `sk_live_xxxxxxxx`

4. After adding variables, go to **Deployments** → click the 3 dots → **Redeploy**

---

## Step 4 — Connect your domain

1. In Vercel → **Settings** → **Domains**
2. Type `dashboard.parkerexpress.com.au` and click **Add**
3. Vercel will show you a DNS record to add — it looks like:
   ```
   Type: CNAME
   Name: dashboard
   Value: cname.vercel-dns.com
   ```
4. Log into your domain registrar (where you bought parkerexpress.com.au)
5. Go to DNS settings and add that CNAME record
6. Wait 5–30 minutes — your app will be live at `dashboard.parkerexpress.com.au`

---

## Step 5 — Set up your clients

1. Go to `dashboard.parkerexpress.com.au/admin`
2. Enter your admin PIN
3. You'll see Maple Movement, Gochi and Elite Reformer already pre-loaded
4. For each client:
   - Get their Starshipit child account API key (Settings → API in their account)
   - Paste it into the API key field
   - Copy their unique dashboard link
   - Send it to them — that's all they need!

---

## Step 6 — Adding future clients

1. Go to `/admin` → click **Add new client**
2. Enter their name and API key
3. Copy their link and send it
4. Add their API key as an environment variable in Vercel (see Step 3)
5. Redeploy

---

## Finding your Starshipit Subscription Key

1. Log into app.starshipit.com
2. Go to **Settings** → **API**
3. The **Ocp-Apim-Subscription-Key** is listed there
4. Each child account also has its own API key in the same place

---

## Updating the app

Any time you want to make changes:
1. Edit the files
2. Upload the changed files to GitHub (drag and drop over the existing ones)
3. Vercel automatically redeploys in ~60 seconds

---

## URLs summary

| URL | Who uses it |
|-----|-------------|
| `dashboard.parkerexpress.com.au/admin` | You (Parker Express) |
| `dashboard.parkerexpress.com.au/client/<token>` | Each client (unique per client) |

---

## Support
Built for Parker Express by Claude (Anthropic).
For changes or new features, save this conversation and continue from here.
