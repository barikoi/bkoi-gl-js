console.log('Checking dist exports...');
try {
  const m = require('./dist/index.cjs');
  console.log('MapboxDraw available:', !!m.MapboxDraw);
  console.log('Map has getDraw:', typeof m.Map.prototype.getDraw);
  console.log('Draw-related exports:', Object.keys(m).filter(k => k.toLowerCase().includes('draw')));
  console.log('All exports:', Object.keys(m).sort());
} catch (e) {
  console.error('Error:', e.message);
}
