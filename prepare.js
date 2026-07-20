const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'node_modules', 'chart.js', 'dist', 'chart.umd.min.js');
const dest = path.join(__dirname, 'libs', 'chart.min.js');
const destDir = path.dirname(dest);

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(src, dest);
console.log('Chart.js copied to libs/chart.min.js');
