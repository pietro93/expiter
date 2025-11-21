import OutputComparator from './compare-outputs.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Snapshot Test Suite
 * Tests the OutputComparator functionality for comparing HTML output
 */
describe('OutputComparator - Snapshot Testing', () => {
  let comparator;

  beforeEach(() => {
    comparator = new OutputComparator(path.join(__dirname, 'snapshots'));
  });

  describe('Snapshot Capture', () => {
    test('should capture and save a snapshot', () => {
      const html = '<html><body><h1>Test Province</h1></body></html>';
      const identifier = 'test-province';

      const snapshot = comparator.captureSnapshot(html, identifier, 'en');

      expect(snapshot).toBeDefined();
      expect(snapshot.identifier).toBe(identifier);
      expect(snapshot.size).toBeGreaterThan(0);
      expect(snapshot.hash).toBeDefined();
      expect(snapshot.lineCount).toBeGreaterThan(0);
    });

    test('should generate consistent filenames', () => {
      const filename1 = comparator.getSnapshotFilename('Test Province', 'en');
      const filename2 = comparator.getSnapshotFilename('Test Province', 'en');

      expect(filename1).toBe(filename2);
      expect(filename1).toMatch(/^snapshot-.*-en\.html$/);
    });

    test('should sanitize identifiers', () => {
      const filename = comparator.getSnapshotFilename('Trentino-Alto Adige/Südtirol', 'it');

      expect(filename).not.toMatch(/[\/\s]/);
      // Should convert ü to u and remove special chars
      expect(filename).toMatch(/^snapshot-trentino-alto-adige-sudtirol-it\.html$/);
    });

    test('should capture metadata along with HTML', () => {
      const html = '<html><body>Test</body></html>';
      const metadata = { custom: 'value', version: '1.0' };

      comparator.captureSnapshot(html, 'test', 'en', metadata);
      const loaded = comparator.loadSnapshot('test', 'en');

      expect(loaded.custom).toBe('value');
      expect(loaded.version).toBe('1.0');
    });
  });

  describe('Snapshot Loading', () => {
    test('should load a saved snapshot', () => {
      const html = '<html><body>Test</body></html>';
      comparator.captureSnapshot(html, 'test-load', 'en');

      const loaded = comparator.loadSnapshot('test-load', 'en');

      expect(loaded).toBeDefined();
      expect(loaded.html).toBe(html);
    });

    test('should return null for non-existent snapshot', () => {
      const loaded = comparator.loadSnapshot('non-existent', 'en');

      expect(loaded).toBeNull();
    });

    test('should handle multiple languages', () => {
      const html = '<html><body>Test</body></html>';

      comparator.captureSnapshot(html + ' EN', 'test-lang', 'en');
      comparator.captureSnapshot(html + ' IT', 'test-lang', 'it');

      const en = comparator.loadSnapshot('test-lang', 'en');
      const it = comparator.loadSnapshot('test-lang', 'it');

      expect(en.html).toContain('EN');
      expect(it.html).toContain('IT');
    });
  });

  describe('Snapshot Comparison', () => {
    test('should detect unchanged snapshots', () => {
      const html = '<html><body>Test</body></html>';
      comparator.captureSnapshot(html, 'test-unchanged', 'en');

      const result = comparator.compareSnapshots(html, 'test-unchanged', 'en');

      expect(result.status).toBe('unchanged');
      expect(result.matches).toBe(true);
    });

    test('should detect changed snapshots', () => {
      const html1 = '<html><body>Original</body></html>';
      const html2 = '<html><body>Modified</body></html>';

      comparator.captureSnapshot(html1, 'test-changed', 'en');
      const result = comparator.compareSnapshots(html2, 'test-changed', 'en');

      expect(result.status).toBe('changed');
      expect(result.matches).toBe(false);
      expect(result.oldHash).not.toBe(result.newHash);
    });

    test('should report new snapshots', () => {
      const html = '<html><body>New</body></html>';
      const result = comparator.compareSnapshots(html, 'test-new', 'en');

      expect(result.status).toBe('new');
    });

    test('should calculate size differences', () => {
      const html1 = '<html><body>Test Content</body></html>';
      const html2 = '<html><body>Test Content with more text</body></html>';

      comparator.captureSnapshot(html1, 'test-size', 'en');
      const result = comparator.compareSnapshots(html2, 'test-size', 'en');

      expect(result.sizeDiff).toBeGreaterThan(0);
      expect(parseFloat(result.sizeDiffPercent)).toBeGreaterThan(0);
    });

    test('should compare line counts', () => {
      const html1 = '<html>\n<body>\n<p>Test</p>\n</body>\n</html>';
      const html2 = '<html>\n<body>\n<p>Test</p>\n<p>More</p>\n</body>\n</html>';

      comparator.captureSnapshot(html1, 'test-lines', 'en');
      const result = comparator.compareSnapshots(html2, 'test-lines', 'en');

      expect(result.newLineCount).toBeGreaterThan(result.oldLineCount);
    });
  });

  describe('Snapshot Organization', () => {
    test('should list snapshots by language', () => {
      const html = '<html><body>Test</body></html>';
      const uniqueId = `org-test-${Date.now()}`;

      comparator.captureSnapshot(html, `${uniqueId}-prov1`, 'en');
      comparator.captureSnapshot(html, `${uniqueId}-prov2`, 'en');
      comparator.captureSnapshot(html, `${uniqueId}-prov3`, 'it');

      const enSnapshots = comparator.getSnapshotsByLanguage('en');
      const itSnapshots = comparator.getSnapshotsByLanguage('it');

      const enCount = enSnapshots.filter(s => s.includes(uniqueId)).length;
      const itCount = itSnapshots.filter(s => s.includes(uniqueId)).length;

      expect(enCount).toBe(2);
      expect(itCount).toBe(1);
    });

    test('should return all snapshots organized by language', () => {
      const html = '<html><body>Test</body></html>';

      comparator.captureSnapshot(html, 'prov-all', 'en');
      comparator.captureSnapshot(html, 'prov-all', 'it');
      comparator.captureSnapshot(html, 'prov-all', 'de');

      const all = comparator.getAllSnapshots();

      expect(all.en).toBeDefined();
      expect(all.it).toBeDefined();
      expect(all.de).toBeDefined();
    });
  });

  describe('Snapshot Management', () => {
    test('should clear snapshots', () => {
      const html = '<html><body>Test</body></html>';

      comparator.captureSnapshot(html, 'test-clear', 'en');
      const beforeLoad = comparator.loadSnapshot('test-clear', 'en');
      expect(beforeLoad).not.toBeNull();

      const deleted = comparator.clearSnapshots('test-clear', 'en');

      expect(deleted).toBeGreaterThan(0);
      const afterLoad = comparator.loadSnapshot('test-clear', 'en');
      expect(afterLoad).toBeNull();
    });

    test('should clear all language variants', () => {
      const html = '<html><body>Test</body></html>';

      comparator.captureSnapshot(html, 'test-all-langs', 'en');
      comparator.captureSnapshot(html, 'test-all-langs', 'it');
      comparator.captureSnapshot(html, 'test-all-langs', 'de');

      const deleted = comparator.clearSnapshots('test-all-langs');

      expect(deleted).toBeGreaterThanOrEqual(6); // HTML + JSON for each language
    });

    test('should generate statistics', () => {
      const html = '<html><body>Test</body></html>';

      comparator.captureSnapshot(html, 'stat-1', 'en');
      comparator.captureSnapshot(html, 'stat-2', 'en');
      comparator.captureSnapshot(html, 'stat-3', 'it');

      const stats = comparator.getStatistics();

      expect(stats.htmlFiles).toBeGreaterThanOrEqual(3);
      expect(stats.jsonFiles).toBeGreaterThanOrEqual(3);
      expect(stats.byLanguage.en).toBeGreaterThanOrEqual(2);
      expect(stats.byLanguage.it).toBeGreaterThanOrEqual(1);
    });

    test('should validate snapshot integrity', () => {
      const html = '<html><body>Test</body></html>';

      comparator.captureSnapshot(html, 'valid-test', 'en');

      const validation = comparator.validateSnapshots();

      expect(validation.valid).toBeGreaterThan(0);
      expect(validation.issues.length).toBe(0);
    });
  });

  describe('Diff Reports', () => {
    test('should generate diff report for changed content', () => {
      const html1 = '<html><body><h1>Title</h1></body></html>';
      const html2 = '<html><body><h1>New Title</h1></body></html>';

      comparator.captureSnapshot(html1, 'test-diff', 'en');
      const report = comparator.generateDiffReport(html2, 'test-diff', 'en');

      expect(report).toContain('DIFF REPORT');
      expect(report).toContain('test-diff');
      expect(report).toContain('Total differences');
    });

    test('should report missing snapshots in diff', () => {
      const html = '<html><body>Test</body></html>';
      const report = comparator.generateDiffReport(html, 'no-snapshot', 'en');

      expect(report).toContain('No saved snapshot found');
    });
  });

  describe('Directory Structure', () => {
    test('should ensure snapshots directory exists', () => {
      expect(() => {
        new OutputComparator(path.join(__dirname, 'snapshots'));
      }).not.toThrow();
    });

    test('should use custom snapshots directory', () => {
      const customDir = path.join(__dirname, 'custom-snapshots');
      const customComparator = new OutputComparator(customDir);

      expect(customComparator.snapshotsDir).toBe(customDir);
    });
  });
});
