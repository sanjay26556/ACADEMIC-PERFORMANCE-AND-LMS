const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'modules', 'teacher', 'TeacherDashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

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

if (!content.includes('fetchWithAuth')) {
    content = replacement + '\n' + content;
    // Replace standalone fetch calls, except for the one inside fetchWithAuth!
    // So we first replace all, then fix the one inside fetchWithAuth
    content = content.replace(/\bfetch\(/g, 'fetchWithAuth(');
    content = content.replace(/await fetchWithAuth\(url, options\)/, 'await fetch(url, options)');
    
    fs.writeFileSync(file, content);
    console.log('Successfully injected fetchWithAuth and updated fetch calls.');
} else {
    console.log('Already updated.');
}
