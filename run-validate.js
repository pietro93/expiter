import HTMLValidator from './tests/validate-html.js';

const validator = new HTMLValidator();
const result = validator.validateAll();
const report = validator.printReport(result);

// Export JSON report
import path from 'path';
import { fileURLToPath } from 'url';
const reportPath = path.join(process.cwd(), 'validation-report.json');
validator.exportJSON(reportPath, result);

process.exit(report.passed ? 0 : 1);
