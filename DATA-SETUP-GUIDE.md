# Data Setup Guide for Phase 7

## Current Situation

The TownGenerator and DataLoader are now updated and ready to work with the full 7,904 Italian municipalities dataset. However, this data isn't in the repository yet.

The project already has a **legacy web scraper** (`parseComuni.js`) that knows how to fetch this data.

## Data Files Needed

### What We Have
- `dataset.json` - 128 Italian provinces with metadata ✅
- `comuni.json` - 255 major cities (fallback)  ✅

### What We Need
- `temp/Agrigento-comuni.json` - Towns in Agrigento province
- `temp/Alessandria-comuni.json` - Towns in Alessandria province
- ... (one file per province, total: 128 files)

## How to Get the Data

### Option 1: Run the Legacy Scraper (Recommended)

The project includes `parseComuni.js` which scrapes Italian government data:

```bash
# Note: This requires 'follow-redirects' package (check package.json)
node parseComuni.js
```

This will:
1. Fetch municipality data from tuttitalia.it (via web.archive.org)
2. Scrape: name, population, surface area, density, altitude
3. Fetch climate zone classifications
4. Create `temp/[Province]-comuni.json` files

**Expected output:**
```
temp/Agrigento-comuni.json
temp/Alessandria-comuni.json
temp/Ancona-comuni.json
... (128 files total)
```

**Advantages:**
- All data is automatically associated with correct province
- Includes rich metadata (population, area, climate zones)
- Uses the existing project infrastructure

### Option 2: Provide Pre-Scraped Data

If the scraper doesn't work (website blocked, outdated), you can:

1. Download complete Italian municipalities data from ISTAT:
   - https://www.istat.it/
   - Look for "Comuni" or "Municipalities" dataset
   - Format as JSON

2. Convert to expected format:
```json
{
  "Roma": {
    "Name": "Roma",
    "Province": "Roma",
    "Population": 2873494,
    "Surface": 1285,
    ...
  },
  "Frascati": {
    "Name": "Frascati",
    "Province": "Roma",
    ...
  }
}
```

3. Place files in `temp/` directory:
   - `temp/Roma-comuni.json`
   - `temp/Milano-comuni.json`
   - etc.

### Option 3: Use Alternative Data Source

Other sources for Italian municipalities:
- OpenStreetMap data
- GeoNames (geonames.org)
- DBpedia
- Wikipedia data dumps

Format these as individual province JSON files and place in `temp/` directory.

## How DataLoader Works Now

The updated `DataLoader.loadComuni()` will:

1. **First:** Check each province directory for JSON files
2. **Then:** Check for `temp/[Province]-comuni.json` files
3. **Fallback:** Use single `comuni.json` file (255 entries)

```javascript
// Automatic loading - no code changes needed
const loader = new DataLoader();
const towns = await loader.loadComuni();
// Returns: All 7,904 towns if temp files exist, else 255 from comuni.json
```

## Testing Your Data Setup

Once you have the data files in `temp/` directory:

```bash
# Test that DataLoader finds all towns
node test-data-loader.mjs
```

Expected output:
```
✓ Loaded comuni: 7904 towns total

Breakdown by province (first 10):
  Agrigento: 43 towns
  Alessandria: 190 towns
  Ancona: 26 towns
  ...
```

## File Structure After Setup

```
expiter/
├── temp/
│   ├── Agrigento-comuni.json      (43 towns)
│   ├── Alessandria-comuni.json    (190 towns)
│   ├── Ancona-comuni.json         (26 towns)
│   └── ... (total: 128 province files)
├── dataset.json                   (128 provinces)
├── comuni.json                    (255 major cities - fallback)
└── ...
```

## Generating Town Pages After Setup

Once data files are in place:

```bash
# Test with first 50 towns
node test-towns.mjs

# Generate for English
node -e "
import TownGenerator from './src/generators/townGenerator.js';
const gen = new TownGenerator();
await gen.generateTownPages('en', 100);
"

# Full generation (all 5 languages, all towns)
# WARNING: This will create 40,000+ files
node src/index.js en it de es fr
```

## Troubleshooting

### "No towns found" or "0 towns loaded"
**Cause:** No `temp/` files found, falling back to `comuni.json`

**Fix:** Either:
1. Run `parseComuni.js` to create files
2. Place JSON files in `temp/` directory
3. Check file naming: must be `temp/[Province]-comuni.json`

### DataLoader error
**Cause:** Province names don't match or JSON format wrong

**Check:**
```bash
# Verify file exists
ls -la temp/ | head

# Check JSON format
cat temp/Roma-comuni.json | jq . | head -20
```

### File generation errors
**Cause:** Template issues (missing breadcrumbs.njk)

**Fix:** See PHASE-7-SUMMARY.md for template issue solutions

## Next Steps

1. **Get the data** - Run scraper or provide files
2. **Test loading** - Run `test-data-loader.mjs`
3. **Fix templates** - Create missing breadcrumbs.njk
4. **Generate pages** - Run TownGenerator
5. **Build full site** - Run master build script

---

**Questions?** Check PHASE-7-SUMMARY.md for full context on all blockers and solutions.
