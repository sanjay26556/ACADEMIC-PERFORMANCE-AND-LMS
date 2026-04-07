const fs = require('fs');
const path = require('path');

const targetDirs = [
    path.join(__dirname, 'src', 'modules', 'teacher'),
    path.join(__dirname, 'src', 'modules', 'teacher', 'components')
];

const replacement = `
export const fetchWithAuth = async (url: string, options: any = {}) => {
    const res = await fetch(url, options);
    if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/lms/teacher/login';
        throw new Error('Unauthorized');
    }
    return res;
};
`;

function processDir(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    
    fs.readdirSync(dirPath).forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isFile() && fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Skip if no fetch or already using fetchWithAuth
            if (content.includes('export const fetchWithAuth')) {
                console.log('Skipping (already has fetchWithAuth):', file);
                return;
            }

            if (!content.includes('fetch(')) {
                console.log('Skipping (no fetch calls):', file);
                return;
            }

            // Find the last import line to safely inject wrapper below imports
            let lastImportIndex = content.lastIndexOf('import ');
            if (lastImportIndex === -1) lastImportIndex = 0;
            
            let insertionIndex = content.indexOf('\n', content.indexOf('\n', lastImportIndex)) + 1;
            if (insertionIndex === 0) insertionIndex = 0; // fallback
            
            content = content.substring(0, insertionIndex) + replacement + '\n' + content.substring(insertionIndex);
            
            // Replace fetch calls
            content = content.replace(/\bfetch\(/g, 'fetchWithAuth(');
            
            // Revert fetchWithAuth's internal fetch
            content = content.replace(/await fetchWithAuth\(url, options\)/g, 'await fetch(url, options)');
            
            fs.writeFileSync(fullPath, content);
            console.log('Processed:', file);
        }
    });
}

targetDirs.forEach(processDir);
console.log('Finished updating fetch statements.');
