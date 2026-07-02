const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'AdminSettings.jsx');

let c = fs.readFileSync(file, 'utf8');

c = c.replace(/color: "var\(--text-h\)"/g, 'color: "white"');
c = c.replace(/border: "1px solid var\(--border\)"/g, 'border: "1px solid rgba(255,255,255,0.1)"'); // some were 0.08, 0.2, etc. This is tricky.
