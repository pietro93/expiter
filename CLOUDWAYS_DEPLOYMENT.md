# Cloudways Deployment Guide

**Objective:** Point Cloudways to the `output/` folder containing 48,291 generated pages

---

## Option 1: Change Document Root (Recommended)

### Via Cloudways Dashboard

1. **Login to Cloudways Dashboard**
   - https://www.cloudways.com/en/dashboard

2. **Select Your Application**
   - From the left sidebar, click your application name

3. **Access Application Settings**
   - Click: `Settings` → `General`
   - OR: `Application` → `Settings` → `General`

4. **Find "Document Root" or "Public Root"**
   - Look for a field labeled:
     - "Document Root"
     - "Public Root"
     - "App Root"

5. **Change the Path**
   ```
   FROM: /public_html
   TO:   /public_html/output
   ```

6. **Save Changes**
   - Click `Save` button
   - Wait for confirmation

7. **Verify**
   - Visit your domain
   - Should load `output/index.html` instead of root `index.html`

---

## Option 2: Upload Files & Change Root

### Via SSH/SFTP

```bash
# 1. SSH into Cloudways server
ssh user@your-cloudways-ip

# 2. Navigate to public_html
cd ~/public_html

# 3. Backup current files
mkdir backup
mv * backup/ 2>/dev/null || true
mv .htaccess backup/ 2>/dev/null || true

# 4. Copy generated files from local to server
rsync -avz output/* user@your-cloudways-ip:~/public_html/

# 5. Verify
ls -la ~/public_html/en/
ls -la ~/public_html/it/
# Should see province/, region/, comuni/ folders
```

---

## Option 3: Use .htaccess Rewrite (If Can't Change Root)

### Create/Edit .htaccess

```apache
# File: public_html/.htaccess
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Don't rewrite actual files/directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Don't rewrite output folder (avoid loop)
  RewriteCond %{REQUEST_FILENAME} !^output/
  
  # Rewrite everything else to output/
  RewriteRule ^(.*)$ output/$1 [L]
  
  # Also handle index.html
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^$ output/index.html [L]
</IfModule>
```

---

## Step-by-Step: Recommended Method

### Step 1: Access Cloudways Dashboard
```
URL: https://www.cloudways.com/en/dashboard
Login with your credentials
```

### Step 2: Open Application Settings
```
Left Sidebar:
  ↓ Click your Application Name
  ↓ Settings tab
  ↓ General section
```

### Step 3: Screenshot Guide

```
Settings > General
┌─────────────────────────────────────────┐
│ Application Settings                    │
├─────────────────────────────────────────┤
│ Application Name: expiter               │
│ Domain: expiter.com                     │
│ Document Root: /public_html        ← EDIT THIS
│                                         │
│ Change to: /public_html/output          │
│                                         │
│ [Cancel] [Save]                         │
└─────────────────────────────────────────┘
```

### Step 4: Update & Save
- Clear the current path
- Type: `/public_html/output`
- Click: `Save`
- Wait for processing (1-2 minutes)

### Step 5: Test Deployment
```bash
# From your local machine
curl -I https://expiter.com/en/province/roma/
# Should return: 200 OK

# Or visit in browser
# https://expiter.com/en/province/roma/
# https://expiter.com/it/comuni/roma/roma/
```

---

## Deployment Checklist

### Before Upload
- [ ] Build complete (`buildProduction.js` finished)
- [ ] 48,291+ files created in `output/`
- [ ] Manifest shows successful generation
- [ ] All 5 languages present (en, it, de, es, fr)
- [ ] Total size ~1.0-1.2 GB

### Upload Process
```bash
# Via SFTP (if you prefer)
sftp user@cloudways-ip

cd public_html/output
mkdir -p output
exit

# Then upload
rsync -avz output/ user@cloudways-ip:~/public_html/output/

# Verify upload
ssh user@cloudways-ip "ls -la public_html/output/en/province | head -5"
```

### After Configuration Change
- [ ] Wait 2-5 minutes for Cloudways to process
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Clear Cloudways cache if available
- [ ] Test homepage: https://expiter.com/
- [ ] Test province: https://expiter.com/en/province/roma/
- [ ] Test town: https://expiter.com/it/comuni/roma/roma/
- [ ] Check 404 page (should be styled)

---

## Quick Deploy Script

Save this as `deploy-to-cloudways.sh`:

```bash
#!/bin/bash
# Deploy to Cloudways

USER="your_ssh_user"
IP="your_cloudways_ip"
REMOTE_PATH="/home/$USER/public_html"

echo "🚀 Deploying to Cloudways..."

# Upload output folder
rsync -avz --delete output/ $USER@$IP:$REMOTE_PATH/output/

echo "✅ Upload complete!"
echo ""
echo "⚙️  Next steps:"
echo "1. Login to Cloudways Dashboard"
echo "2. Settings > General"
echo "3. Change 'Document Root' to: /public_html/output"
echo "4. Click Save"
echo "5. Wait 2-5 minutes"
echo "6. Visit https://expiter.com/"
echo ""
echo "✨ Deployment complete!"
```

Run:
```bash
chmod +x deploy-to-cloudways.sh
./deploy-to-cloudways.sh
```

---

## File Structure Expected

After deployment to `public_html/output/`:

```
public_html/
├── output/                    ← Document root points here
│   ├── en/
│   │   ├── province/
│   │   │   ├── roma/index.html
│   │   │   ├── milano/index.html
│   │   │   └── ... (128 total)
│   │   ├── region/
│   │   │   └── ... (20 pages)
│   │   └── sitemap.xml
│   ├── it/
│   │   ├── province/
│   │   ├── region/
│   │   ├── comuni/
│   │   │   ├── roma/
│   │   │   │   ├── roma/index.html
│   │   │   │   ├── frascati/index.html
│   │   │   │   └── ... (towns)
│   │   │   └── ... (all provinces)
│   │   └── sitemap.xml
│   ├── de/, es/, fr/         ← Same structure
│   ├── assets/
│   │   ├── search-index-*.json
│   │   └── sitemap-index.xml
│   └── BUILD_MANIFEST.json
└── ... (old files - can delete)
```

---

## Troubleshooting

### Issue: "404 Not Found" After Change

**Solution:**
1. Check Document Root was saved correctly
2. Clear Cloudways cache: `Settings` → `Cache` → `Clear Cache`
3. Wait 2-5 minutes
4. Try different browser/incognito

### Issue: URLs Look Wrong

**Example:** `https://expiter.com/output/en/province/roma/`

**Solution:**
- Document Root not changed correctly
- Verify it's set to `/public_html/output` (not `/public_html`)
- Not `/public_html/output/output`

### Issue: Static Files Not Loading (CSS, JS, Images)

**Solution:**
1. Check `assets/` folder exists in output
2. Verify paths in HTML: `<link href="/assets/..."`
3. Should be: `/assets/style.css` (not `/output/assets/...`)

### Issue: Sitemaps Not Accessible

**Fix:**
```
Sitemap Index: /sitemap-index.xml
Language-specific: /en/sitemap.xml, /it/sitemap.xml, etc.
```

Should be accessible at:
```
https://expiter.com/sitemap-index.xml
https://expiter.com/en/sitemap.xml
```

---

## Verification Commands

After deployment, verify with:

```bash
# SSH into server
ssh user@cloudways-ip

# Check files are there
ls -la public_html/output/en/province/ | head -10
ls -la public_html/output/it/comuni/roma/ | head -10

# Count files
find public_html/output -name "*.html" | wc -l
# Should show 47,275+

# Check manifest
cat public_html/output/BUILD_MANIFEST.json

# Test specific pages
curl -I https://expiter.com/en/province/roma/
curl -I https://expiter.com/it/comuni/roma/roma/
```

---

## Post-Deployment Checklist

- [ ] Cloudways Document Root changed to `/public_html/output`
- [ ] All 48,291 files uploaded
- [ ] Homepage loads: https://expiter.com/
- [ ] English province loads: https://expiter.com/en/province/roma/
- [ ] Italian town loads: https://expiter.com/it/comuni/roma/roma/
- [ ] German region loads: https://expiter.com/de/region/lazio/
- [ ] Search indices exist: `curl https://expiter.com/assets/search-index-en.json`
- [ ] Sitemaps valid: `curl https://expiter.com/sitemap-index.xml`
- [ ] No 404 errors in logs
- [ ] CSS/JS/Images load correctly
- [ ] Mobile responsive works
- [ ] Analytics tracking active
- [ ] SEO meta tags present

---

## Support

If you need help with Cloudways specifically:
- **Support:** https://support.cloudways.com/
- **Docs:** https://docs.cloudways.com/
- **Managed Cloud:** They provide managed support

---

**Status:** Ready to deploy when build completes ✅
