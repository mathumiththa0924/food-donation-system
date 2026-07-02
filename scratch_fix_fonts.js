const fs = require('fs');
const path = require('path');

const srcDir = path.join('c:', 'Users', 'MOHAMED', 'Downloads', 'food-donation-system', 'frontend', 'src');

const pattern1 = /,\s*fontFamily:\s*["'][^"']+["']/g;
const pattern2 = /fontFamily:\s*["'][^"']+["']\s*,?/g;

let count = 0;

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content.replace(pattern1, '');
            newContent = newContent.replace(pattern2, '');
            if (newContent !== content) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Updated ${fullPath}`);
                count++;
            }
        }
    }
}

walk(srcDir);
console.log(`Total files updated: ${count}`);
