const fs = require('fs');
const path = require('path');

// Ensure workers-site directory exists
const workersSiteDir = path.join(__dirname, 'workers-site');
if (!fs.existsSync(workersSiteDir)) {
  fs.mkdirSync(workersSiteDir, { recursive: true });
}

// Copy the worker file
fs.copyFileSync(
  path.join(__dirname, '_worker.js'),
  path.join(workersSiteDir, 'index.js')
);

console.log('Worker file copied to workers-site/index.js');