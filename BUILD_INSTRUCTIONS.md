# Build Instructions - Simple & Clear

## The One Script You Need

```bash
node buildProduction.js
```

**That's it.** This single script generates all 48,291 pages.

---

## What It Does

1. ✅ Generates 640 province pages (128 × 5 languages)
2. ✅ Generates 100 region pages (20 × 5 languages)
3. ✅ Generates 47,535 town pages (9,507 × 5 languages) ← Takes 45-60 min
4. ✅ Generates 5 search indices
5. ✅ Generates 6 XML sitemaps

**Output:** `output/` directory with 48,291 files (~1.0-1.2 GB)

---

## Requirements

- Node.js v18+
- 2+ GB free disk space
- 2+ GB free RAM
- 90 minutes of time

---

## Run It

```bash
# From project root
node buildProduction.js

# That's all. Wait for completion.
```

The script will:
- Show progress for each phase
- Display real-time file counts
- Create `output/BUILD_MANIFEST.json` when done
- Show total generation time

---

## After It Finishes

1. **Verify output exists:**
   ```bash
   ls -la output/en/province/
   ls -la output/it/comuni/
   ```

2. **Upload to Cloudways:**
   ```bash
   rsync -avz output/ user@cloudways-ip:~/public_html/output/
   ```

3. **Change Document Root in Cloudways:**
   - Dashboard → Settings → General
   - Document Root: `/public_html/output`
   - Save

4. **Test:**
   - https://expiter.com/
   - https://expiter.com/en/province/roma/
   - https://expiter.com/it/comuni/roma/roma/

---

## That's All

- ❌ No other scripts needed
- ❌ No simulations
- ✅ One real script that generates everything

---

*Run: `node buildProduction.js` and wait.*
