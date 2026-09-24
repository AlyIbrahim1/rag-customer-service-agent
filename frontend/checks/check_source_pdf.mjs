import assert from 'node:assert/strict';
import { planPdf, sourcePdfTarget } from '../src/content.js';

for (const [title, index] of [
  ['Emerald', 0], ['HekayaMixat', 1], ['HekayaInternet', 2],
  ['PrepaidSystems', 3], ['DataLine', 4],
]) {
  assert.deepEqual(sourcePdfTarget({ title, page: 3 }), { index, page: 3 });
  assert.match(planPdf(index, 'en'), /^\/pdfs\/en\/[^/]+\.pdf$/);
}
assert.deepEqual(sourcePdfTarget({ title: 'DataLine.pdf', page: 0 }), { index: 4, page: 1 });
assert.equal(sourcePdfTarget({ title: 'Unknown', page: 1 }), null);
console.log('Source PDFs map to the expected plans and pages.');
