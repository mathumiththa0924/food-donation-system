const fs = require('fs');
const data = JSON.parse(fs.readFileSync('lint-results.json', 'utf8'));

const summary = {};

data.forEach(file => {
  if (file.messages.length > 0) {
    const filePath = file.filePath.split('frontend\\\\')[1] || file.filePath;
    summary[filePath] = {};
    file.messages.forEach(msg => {
      const rule = msg.ruleId || 'syntax/parsing error';
      if (!summary[filePath][rule]) {
        summary[filePath][rule] = [];
      }
      summary[filePath][rule].push(msg.line);
    });
  }
});

console.log(JSON.stringify(summary, null, 2));
