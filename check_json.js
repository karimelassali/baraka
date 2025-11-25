const fs = require('fs');
const files = ['messages/en.json', 'messages/it.json', 'messages/ar.json'];
files.forEach(file => {
    try {
        JSON.parse(fs.readFileSync(file, 'utf8'));
        console.log(file + ': Valid');
    } catch (e) {
        console.log(file + ': ' + e.message);
    }
});
