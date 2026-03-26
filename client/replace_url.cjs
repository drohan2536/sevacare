const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/rohan/.gemini/antigravity/scratch/sevacare/client/src';
const configPath = path.join(dir, 'config.js');

fs.writeFileSync(configPath, `import { Capacitor } from '@capacitor/core';\nexport const API_BASE_URL = Capacitor.isNativePlatform() ? 'http://10.72.1.1:5000/api' : '/api';\n`);

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      if (fullPath === configPath) continue;
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('http://10.72.1.1:5000/api')) {
        let p = path.relative(path.dirname(fullPath), configPath).replace(/\\/g, '/');
        if (!p.startsWith('.')) p = './' + p;

        let newContent = content.replace(/['"]http:\/\/10\.72\.1\.1:5000\/api([^'"]*)['"]/g, '`${API_BASE_URL}$1`');
        
        if (!content.includes('import { API_BASE_URL }')) {
            const lines = newContent.split('\n');
            let lastImport = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith('import ')) lastImport = i;
            }
            if (lastImport !== -1) {
                lines.splice(lastImport + 1, 0, `import { API_BASE_URL } from '${p}';`);
                newContent = lines.join('\n');
            } else {
                newContent = `import { API_BASE_URL } from '${p}';\n` + newContent;
            }
        }
        
        fs.writeFileSync(fullPath, newContent);
        console.log('Updated ' + fullPath);
      }
    }
  }
}

processDirectory(dir);
