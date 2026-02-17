const fs = require('fs');
const content = fs.readFileSync('.env', 'utf8');
console.log('--- START .env ---');
for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const code = content.charCodeAt(i);
    if (code < 32 || code > 126) {
        console.log(`Char at ${i}: code=${code} (Hidden/Control)`);
    }
}
console.log('--- END .env ---');
console.log(content);
