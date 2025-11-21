# Expiter Nunjucks Migration - Progress Tracker

**Project Start Date:** November 21, 2025  
**Overall Status:** 🟡 IN PROGRESS  
**Total Tasks:** 24  
**Completed:** 1 (Setup)  
**In Progress:** 0  
**Blocked:** 0  

**Git Branch:** `nunjucks-migration` ([PR](https://github.com/pietro93/expiter/pull/new/nunjucks-migration))  
**Cloudways Staging:** Ready  

---

## PHASE 1: FOUNDATION & SETUP

### Task 1.1: Project Structure Initialization
**Status:** 🔲 TODO  
**Priority:** HIGH  
**Dependencies:** None  
**Est. Tokens:** 2,000  

**Checklist:**
- [ ] Create src/generators directory
- [ ] Create src/templates/{layouts,components,partials} directories
- [ ] Create src/i18n, src/utils, src/parsers, src/config, src/scripts directories
- [ ] Create tests/{fixtures,snapshots,e2e} directories
- [ ] Create output and dist_preview directories
- [ ] Create docs directory
- [ ] Create placeholder files (src/index.js, src/config/constants.js, etc.)
- [ ] Verify structure with `ls -R src/`

**Validation:** ✅ All directories exist, can list 8+ subdirectories in src/, src/index.js writable

**Notes:**

---

### Task 1.2: Install Core Dependencies
**Status:** 🔲 TODO  
**Priority:** HIGH  
**Dependencies:** Task 1.1  
**Est. Tokens:** 1,500  

**Checklist:**
- [ ] Install nunjucks@3.2.4
- [ ] Install i18next@23.5.0
- [ ] Install axios@1.6.7
- [ ] Install sharp@0.33.4
- [ ] Install jsdom@20.0.1
- [ ] Install dev deps (jest@29.7.0, eslint@8.50.0, prettier@3.0.0, dotenv@16.3.1)
- [ ] Verify versions with `npm list nunjucks i18next jest`

**Validation:** ✅ npm list shows exact versions, no critical peer dependency warnings

**Notes:**

---

### Task 1.3: Configure Nunjucks & i18next Initialization
**Status:** 🔲 TODO  
**Priority:** HIGH  
**Dependencies:** Task 1.2  
**Est. Tokens:** 3,000  

**Checklist:**
- [ ] Create src/config/template-engine.js with setupNunjucks()
- [ ] Add custom filters to Nunjucks (isExcellent, isSafe, formatCurrency)
- [ ] Create src/config/i18n-config.js with setupI18n()
- [ ] Validate both files with `node -c`

**Validation:** ✅ Both files parse without syntax errors, export correct functions

**Notes:**

---

### Task 1.4: Create Base Translation Files (Stub)
**Status:** 🔲 TODO  
**Priority:** HIGH  
**Dependencies:** Task 1.3  
**Est. Tokens:** 2,500  

**Checklist:**
- [ ] Create src/i18n/en.json with stub content
- [ ] Create src/i18n/it.json with Italian translations
- [ ] Create src/i18n/de.json with German translations
- [ ] Create src/i18n/es.json with Spanish translations
- [ ] Create src/i18n/fr.json with French translations
- [ ] Verify all files are valid JSON
- [ ] Verify each file contains ≥15 keys

**Validation:** ✅ All 5 files exist, each parses without error, contains minimum keys

**Notes:**

---

## PHASE 2: TEMPLATE SYSTEM

### Task 2.1: Create Master Base Layout
**Status:** 🔲 TODO  
**Priority:** HIGH  
**Dependencies:** Task 1.4  
**Est. Tokens:** 3,500  

**Checklist:**
- [ ] Create src/templates/layouts/base.njk with {% block content %}
- [ ] Create stub: src/templates/partials/head.njk
- [ ] Create stub: src/templates/partials/scripts.njk
- [ ] Create stub: src/templates/components/navbar.njk
- [ ] Create stub: src/templates/components/sidebar.njk
- [ ] Create stub: src/templates/components/footer.njk
- [ ] Verify base.njk parses without errors

**Validation:** ✅ base.njk extends properly, all includes referenced

**Notes:**

---

### Task 2.2: Create Province Detail Template
**Status:** 🔲 TODO  
**Priority:** HIGH  
**Dependencies:** Task 2.1  
**Est. Tokens:** 4,500  

**Checklist:**
- [ ] Create src/templates/layouts/province-detail.njk
- [ ] Add 3 tab sections (Quality, Cost, Nomads)
- [ ] Create stub partials for all includes
- [ ] Verify template parses with test data

**Validation:** ✅ Template renders without errors, extends base.njk

**Notes:**

---

### Task 2.3: Create Quality Score Component (Macro)
**Status:** 🔲 TODO  
**Priority:** MEDIUM  
**Dependencies:** Task 2.1  
**Est. Tokens:** 3,000  

**Checklist:**
- [ ] Create src/templates/components/quality-score.njk
- [ ] Create scoreCard macro
- [ ] Create scoreGrid macro
- [ ] Verify syntax is correct

**Validation:** ✅ File contains both macros, parses without errors

**Notes:**

---

## PHASE 3: DATA UTILITIES

### Task 3.1: Create Data Loader Utility
**Status:** 🔲 TODO  
**Priority:** HIGH  
**Dependencies:** Task 1.2  
**Est. Tokens:** 2,500  

**Checklist:**
- [ ] Create src/utils/data-loader.js with DataLoader class
- [ ] Implement loadDataset() method
- [ ] Implement loadComuni() method
- [ ] Implement loadCrimeData() method
- [ ] Implement validateDataset() method
- [ ] Add caching mechanism

**Validation:** ✅ Class exports correctly, all methods are async, return Promises

**Notes:**

---

### Task 3.2: Create Province Formatter Utility
**Status:** 🔲 TODO  
**Priority:** HIGH  
**Dependencies:** Task 3.1  
**Est. Tokens:** 4,000  

**Checklist:**
- [ ] Create src/utils/formatter.js with ProvinceFormatter class
- [ ] Implement formatProvince() method
- [ ] Implement calculateRating() method
- [ ] Implement formatNumber() method
- [ ] Implement formatCurrency() method
- [ ] Pre-calculate all metric ratings

**Validation:** ✅ formatProvince() returns object with nested properties (healthcare, safety, climate, costOfLiving)

**Notes:**

---

### Task 3.3: Create SEO Builder Utility
**Status:** 🔲 TODO  
**Priority:** MEDIUM  
**Dependencies:** Task 3.2  
**Est. Tokens:** 2,500  

**Checklist:**
- [ ] Create src/utils/seo-builder.js with SEOBuilder class
- [ ] Implement buildMetaTags() method
- [ ] Implement buildDescription() method
- [ ] Support all 5 languages
- [ ] Generate canonical URLs

**Validation:** ✅ buildMetaTags() returns object with title, description, keywords, image, canonical, lang

**Notes:**

---

## PHASE 4: GENERATOR IMPLEMENTATION

### Task 4.1: Create Snapshot Test Infrastructure
**Status:** 🔲 TODO  
**Priority:** MEDIUM  
**Dependencies:** Task 3.3  
**Est. Tokens:** 3,500  

**Checklist:**
- [ ] Create tests/compare-outputs.js with OutputComparator class
- [ ] Implement captureSnapshot() method
- [ ] Implement compareSnapshots() method
- [ ] Create tests/snapshot.test.js
- [ ] Verify snapshots directory structure

**Validation:** ✅ OutputComparator exports correctly, snapshots saved to tests/snapshots/

**Notes:**

---

### Task 4.2: Implement Single Province Page Generator (English Only)
**Status:** 🔲 TODO  
**Priority:** HIGH  
**Dependencies:** Task 4.1, Task 3.3  
**Est. Tokens:** 5,000  

**Checklist:**
- [ ] Create src/generators/pageGenerator.js with PageGenerator class
- [ ] Implement generate() method
- [ ] Implement generateProvincePage() method
- [ ] Implement calculateAverage() method
- [ ] Create src/index.js entry point
- [ ] Configure parallel processing with p-limit

**Validation:** ✅ PageGenerator exports, can be run with `node src/index.js en`, generates 107 HTML files

**Notes:**

---

### Task 4.3: Generate Output for English & Compare with Legacy
**Status:** 🔲 TODO  
**Priority:** HIGH  
**Dependencies:** Task 4.2  
**Est. Tokens:** 2,000  

**Checklist:**
- [ ] Run `node src/index.js en`
- [ ] Verify 107 files created in output/province/
- [ ] Count files and compare with legacy
- [ ] Sample 3 files for size comparison
- [ ] Verify all HTML contains closing tags

**Validation:** ✅ Output file count = 107, size within ±5% of legacy, all HTML valid

**Notes:**

---

### Task 4.4: Integrate i18n & Generate Multi-Language Output
**Status:** 🔲 TODO  
**Priority:** HIGH  
**Dependencies:** Task 4.3  
**Est. Tokens:** 3,500  

**Checklist:**
- [ ] Add generateAllLanguages() method to PageGenerator
- [ ] Update context to use i18next for translations
- [ ] Loop through all 5 languages (en, it, de, es, fr)
- [ ] Verify 535 total files (107 × 5)
- [ ] Check no errors during generation

**Validation:** ✅ 535 total files generated, no errors, all languages processed

**Notes:**

---

### Task 4.5: Generate Index/Landing Page
**Status:** 🔲 TODO  
**Priority:** HIGH  
**Dependencies:** Task 4.4  
**Est. Tokens:** 3,000  

**Checklist:**
- [ ] Create src/templates/layouts/index.njk
- [ ] Create src/generators/indexGenerator.js
- [ ] Generate 5 index files (one per language)
- [ ] Verify each index contains all 107 provinces
- [ ] Test province links are correct

**Validation:** ✅ 5 index files created, each contains 107 province links, HTML valid

**Notes:**

---

### Task 4.6: Generate Region Pages
**Status:** 🔲 TODO  
**Priority:** HIGH  
**Dependencies:** Task 4.5  
**Est. Tokens:** 3,000  

**Checklist:**
- [ ] Create src/generators/regionGenerator.js
- [ ] Create src/templates/layouts/region-detail.njk
- [ ] Generate region pages for all 20 Italian regions
- [ ] Multiply by 5 languages = 100 files
- [ ] Verify file count and structure

**Validation:** ✅ 100 region files generated (20 × 5), files in output/region/

**Notes:**

---

### Task 4.7: Generate Safety & Other Specialized Pages
**Status:** 🔲 TODO  
**Priority:** MEDIUM  
**Dependencies:** Task 4.6  
**Est. Tokens:** 2,500  

**Checklist:**
- [ ] Create src/generators/safetyGenerator.js
- [ ] Create src/generators/townGenerator.js
- [ ] Create src/generators/comuniGenerator.js
- [ ] Create src/generators/sitemapGenerator.js
- [ ] Generate all specialized pages
- [ ] Target total: ≥650 output files

**Validation:** ✅ ≥650 total output files, all special generators working

**Notes:**

---

## PHASE 5: TESTING & VALIDATION

### Task 5.1: Run Full HTML Validation
**Status:** 🔲 TODO  
**Priority:** HIGH  
**Dependencies:** Task 4.7  
**Est. Tokens:** 2,000  

**Checklist:**
- [ ] Create tests/validate-html.js
- [ ] Scan all generated HTML files
- [ ] Check for <html>, <head>, </head> tags
- [ ] Report any invalid files
- [ ] Fix any issues

**Validation:** ✅ All generated HTML files pass basic validation, 0 invalid files

**Notes:**

---

### Task 5.2: Compare Output Size with Legacy
**Status:** 🔲 TODO  
**Priority:** MEDIUM  
**Dependencies:** Task 5.1  
**Est. Tokens:** 1,500  

**Checklist:**
- [ ] Calculate legacy output size (du -sh dist_old/)
- [ ] Calculate new output size (du -sh output/)
- [ ] Count legacy files
- [ ] Count new files
- [ ] Compare generation time

**Validation:** ✅ File counts match (535), size within ±10%, generation time noted

**Notes:**

---

### Task 5.3: Document Code Coverage
**Status:** 🔲 TODO  
**Priority:** MEDIUM  
**Dependencies:** Task 5.2  
**Est. Tokens:** 2,000  

**Checklist:**
- [ ] Create jest.config.js with coverage thresholds
- [ ] Run `npm test -- --coverage`
- [ ] Generate HTML coverage report
- [ ] Verify ≥75% line coverage
- [ ] Check critical paths >85%

**Validation:** ✅ Coverage ≥75% for lines, critical paths >85%

**Notes:**

---

## PHASE 6: FINALIZATION

### Task 6.1: Create Migration Documentation
**Status:** 🔲 TODO  
**Priority:** MEDIUM  
**Dependencies:** Task 5.3  
**Est. Tokens:** 2,500  

**Checklist:**
- [ ] Create docs/MIGRATION_COMPLETE.md
- [ ] Document before/after metrics
- [ ] List all deliverables (file counts by type)
- [ ] Include testing results
- [ ] Add next steps section

**Validation:** ✅ Documentation file created, contains before/after table, deliverables listed

**Notes:**

---

### Task 6.2: Archive Legacy Generators
**Status:** 🔲 TODO  
**Priority:** MEDIUM  
**Dependencies:** Task 6.1  
**Est. Tokens:** 1,000  

**Checklist:**
- [ ] Create legacy_backup/ directory
- [ ] Move pageGeneratorSSR*.js files
- [ ] Move indexGeneratorSSR*.js files
- [ ] Move regionGeneratorSSR*.js files
- [ ] Move other legacy generators
- [ ] Commit to git with message
- [ ] Create legacy-generators branch

**Validation:** ✅ legacy_backup/ contains all old generators, Git commit created

**Notes:**

---

### Task 6.3: Production Deployment Checklist
**Status:** 🔲 TODO  
**Priority:** MEDIUM  
**Dependencies:** Task 6.2  
**Est. Tokens:** 1,500  

**Checklist:**
- [ ] Create .deploy-checklist file
- [ ] List pre-deployment steps
- [ ] List deployment steps
- [ ] List post-deployment steps
- [ ] Document rollback procedure
- [ ] Include validation points

**Validation:** ✅ .deploy-checklist exists, contains 20+ checklist items, rollback documented

**Notes:**

---

### Task 6.4: Final Verification & Sign-Off
**Status:** 🔲 TODO  
**Priority:** HIGH  
**Dependencies:** Task 6.3  
**Est. Tokens:** 1,500  

**Checklist:**
- [ ] Create verify-migration.sh script
- [ ] Check file counts (province, index, region, specialized)
- [ ] Run ESLint validation
- [ ] Run full test suite
- [ ] Measure generation time (<35s target)
- [ ] Verify output size
- [ ] Check Git status
- [ ] Generate final report

**Validation:** ✅ All checks pass, file counts match, generation time <35s, Git clean

**Notes:**

---

## Summary Statistics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Phases Completed** | 6 | 0 | 🔴 0% |
| **Tasks Completed** | 24 | 0 | 🔴 0% |
| **Generator Files** | 6 | 0 | 🔴 Not started |
| **Province Pages** | 535 | 0 | 🔴 Not started |
| **Total Output Files** | ≥650 | 0 | 🔴 Not started |
| **Generation Time** | <30s | - | ⏳ TBD |
| **Code Coverage** | ≥75% | - | ⏳ TBD |
| **Test Passing** | 100% | - | ⏳ TBD |

---

## Recent Activity Log

| Timestamp | Task | Status | Notes |
|-----------|------|--------|-------|
| 2025-11-21 12:00 | Git setup | ✅ DONE | Created nunjucks-migration branch, pushed to origin |
| 2025-11-21 11:50 | Migration started | 🟡 IN PROGRESS | Initial kanban created, progress tracker added |

---

## Blockers & Issues

None currently.

---

## Next Action

👉 **Start Task 1.1:** Create project directory structure
