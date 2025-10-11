const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../dist/index.mjs');
const shebang = '#!/usr/bin/env node\n';

const content = fs.readFileSync(filePath, 'utf8');
if (!content.startsWith(shebang)) {
  fs.writeFileSync(filePath, shebang + content);
}
