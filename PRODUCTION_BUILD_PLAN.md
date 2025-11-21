# Production Build Execution Plan

**Status:** Ready to Execute  
**Date:** November 21, 2025  
**Target:** Generate 47,286 complete static pages for production deployment

---

## Build Scope

### Total Pages to Generate

| Type | Count | Details |
|------|-------|---------|
| **Province Pages** | 640 | 128 provinces × 5 languages |
| **Region Pages** | 100 | 20 regions × 5 languages |
| **Town Pages** | 47,535 | 9,507 towns × 5 languages |
| **Search Indices** | 5 | One per language (JSON) |
| **XML Sitemaps** | 6 | Main index + 5 language-specific |
| **TOTAL** | **47,286** | Complete production site |

---

## Data Sources Prepared

✅ **Province Data:** `dataset.json` (128 records)  
✅ **Town Data:** Extracted from HTML → `temp/[Province]-comuni.json` (9,507 towns)  
✅ **Region Data:** Built from provinces (20 regions)  
✅ **Configuration:** All i18n files ready (5 languages)  

### Extraction Results
```
Extracted: 9,507 towns
Saved in: temp/ directory (107 JSON files)
Status: ✅ COMPLETE
```

---

## Build Execution Steps

### Step 1: Start Production Build
```bash
node buildProduction.js
```

**Note:** This is the ONLY build script. Use this one.

This will:
1. Verify all data files exist
2. Start phase-by-phase generation
3. Report progress in real-time
4. Estimate remaining time
5. Create build manifest

### Step 2: Monitor Progress

The build will proceed through phases:

**Phase 0:** Data Extraction (Already Done ✅)
- 9,507 towns extracted from legacy HTML
- 107 province JSON files created

**Phase 1:** Province Pages (5-10 min)
- Generate 128 × 5 = 640 HTML pages
- ~150 KB per page
- Total: ~96 MB

**Phase 2:** Region Pages (2-3 min)
- Generate 20 × 5 = 100 HTML pages  
- ~200 KB per page
- Total: ~20 MB

**Phase 3:** Town Pages (45-60 min) ⏳ LONGEST PHASE
- Generate 9,507 × 5 = 47,535 HTML pages
- ~18 KB per page (optimized)
- Total: ~855 MB
- Concurrency: 20 parallel tasks

**Phase 4:** Comparison Pages (1-2 min)
- Generate 5-10 comparison pages
- Multi-language support

**Phase 5:** Search Indices (3-5 min)
- Generate 5 JSON search indices
- ~30 KB each

**Phase 6:** XML Sitemaps (2-3 min)
- Generate main sitemap index
- 5 language-specific sitemaps

### Step 3: Verify Output
```bash
# Check file counts
find output -name "*.html" | wc -l    # Should be 47,275+
find output -name "*.json" | wc -l    # Should be 5+
find output -name "*.xml" | wc -l     # Should be 6

# Check total size
du -sh output/                         # Should be ~1.0-1.2 GB

# Validate some pages
grep -l "og:title" output/province/*/index.html | wc -l  # Should match province count
```

### Step 4: Generate Report
```bash
node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('output/BUILD_MANIFEST.json'));
console.log('Build Complete!');
console.log(JSON.stringify(manifest, null, 2));
"
```

---

## Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|-----------|
| Setup & Data Check | 2 min | 2 min |
| Province Pages | 8 min | 10 min |
| Region Pages | 3 min | 13 min |
| **Town Pages** | **50 min** | **63 min** |
| Comparisons | 2 min | 65 min |
| Search Indices | 4 min | 69 min |
| Sitemaps | 3 min | 72 min |
| Verification | 5 min | **77 min** |

**Total Estimated Time:** ~77-90 minutes (1.5 hours)

---

## System Requirements

### Minimum Specs
- **RAM:** 2 GB free (generator uses ~500 MB)
- **Disk:** 2 GB free (for output + temp files)
- **CPU:** Modern multi-core processor
- **Network:** Not required (all local generation)

### Recommended Specs
- **RAM:** 4+ GB free
- **Disk:** 5 GB free
- **CPU:** 4+ cores (parallelization helps)

---

## Expected Output Structure

After generation completes:

```
output/
├── en/                              ← English (root)
│   ├── province/
│   │   ├── roma/index.html
│   │   ├── milano/index.html
│   │   └── ... (128 provinces)
│   ├── region/
│   │   ├── lazio/index.html
│   │   └── ... (20 regions)
│   └── sitemap.xml
├── it/                              ← Italian
│   ├── province/ ... (128)
│   ├── region/ ... (20)
│   ├── comuni/
│   │   ├── roma/
│   │   │   ├── roma/index.html
│   │   │   ├── frascati/index.html
│   │   │   └── ... (towns for Roma province)
│   │   ├── milano/ ... (towns for Milano)
│   │   └── ... (all provinces with towns)
│   └── sitemap.xml
├── de/                              ← German
│   ├── province/ ... (128)
│   ├── region/ ... (20)
│   ├── comuni/ ... (9,507)
│   └── sitemap.xml
├── es/                              ← Spanish
│   ├── province/ ... (128)
│   ├── region/ ... (20)
│   ├── comuni/ ... (9,507)
│   └── sitemap.xml
├── fr/                              ← French
│   ├── province/ ... (128)
│   ├── region/ ... (20)
│   ├── comuni/ ... (9,507)
│   └── sitemap.xml
├── assets/
│   ├── search-index-en.json
│   ├── search-index-it.json
│   ├── search-index-de.json
│   ├── search-index-es.json
│   ├── search-index-fr.json
│   └── sitemap-index.xml
└── BUILD_MANIFEST.json
```

---

## Quality Checks

After generation, verify:

- [ ] All 47,275+ HTML files created
- [ ] All files have valid HTML structure
- [ ] All meta tags present (OG, Twitter, JSON-LD)
- [ ] Canonical URLs correct
- [ ] Images/CSS/JS references valid
- [ ] Sitemaps well-formed XML
- [ ] Search indices valid JSON
- [ ] No broken links within site
- [ ] Total size ~1.0-1.2 GB
- [ ] Generation completed in <2 hours

---

## Troubleshooting

### Issue: Out of Memory During Generation
**Solution:** Reduce concurrency
```bash
# Edit generateProductionSite.js, change line:
// this.concurrency = options.concurrency || 20;
// to:
// this.concurrency = options.concurrency || 5;
```

### Issue: Some Pages Failed to Generate
**Solution:** Identify and re-generate specific province
```bash
# Re-run just one province:
node -e "
const TownGenerator = require('./src/generators/townGenerator.js');
const gen = new TownGenerator();
gen.generateProvinceTowns('Milano', 'en').then(console.log);
"
```

### Issue: Disk Space Running Out
**Solution:** Generate in batches
```bash
# Generate one language at a time
node generateProductionSite.js --language=en
node generateProductionSite.js --language=it
# etc.
```

---

## Post-Generation Steps

### 1. Validate Output
```bash
# Run validation script
bash verify-migration.sh
```

### 2. Create Backup
```bash
# Backup before deploying
cp -r output output-backup-2025-11-21
```

### 3. Deploy to Staging
```bash
# Copy to Cloudways staging server
rsync -avz output/* user@staging.expiter.com:/var/www/public_html/
```

### 4. Test in Staging
- [ ] Browse provinces
- [ ] Check town pages
- [ ] Test search
- [ ] Verify sitemaps
- [ ] Check analytics tracking
- [ ] Mobile responsive test
- [ ] SEO checks (meta tags, canonical)

### 5. Deploy to Production
After staging validation:
```bash
rsync -avz output/* user@production.expiter.com:/var/www/public_html/
```

### 6. Monitor (24 hours)
- [ ] Check error logs
- [ ] Monitor page speed
- [ ] Verify analytics data
- [ ] Check search console
- [ ] User feedback

---

## Success Criteria

✅ Generation completes without errors  
✅ 47,286+ files created  
✅ All file sizes valid  
✅ Build time < 2 hours  
✅ All pages have correct meta tags  
✅ Sitemaps valid XML  
✅ Search indices valid JSON  
✅ URL structure matches legacy  
✅ All 5 languages present  
✅ Ready for production deployment

---

## Ready to Execute?

When ready to start the production build:

```bash
# 1. Ensure you're on nunjucks-migration branch
git status

# 2. Start the production build
node generateProductionSite.js

# 3. Monitor the output
# The script will show real-time progress

# 4. Once complete, verify output
du -sh output/
find output -type f | wc -l
```

**Estimated completion time: ~77-90 minutes**

---

## Contact & Support

If issues arise during generation:
1. Check `.deploy-checklist` for configuration issues
2. Review `MIGRATION_PROGRESS.md` for context
3. Check logs in `output/` for specific errors
4. Verify temp data in `temp/` directory

---

**BUILD STATUS:** ✅ READY TO EXECUTE

Start when ready: `node generateProductionSite.js`
