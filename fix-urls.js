const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('./frontend/src');
let changed = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  content = content.replace(/"http:\/\/localhost:5000\/api\/v1(.*?)"/g, '\`${process.env.NEXT_PUBLIC_API_URL || \'http://localhost:5000/api/v1\'}$1\`');
  content = content.replace(/'http:\/\/localhost:5000\/api\/v1(.*?)'/g, '\`${process.env.NEXT_PUBLIC_API_URL || \'http://localhost:5000/api/v1\'}$1\`');
  content = content.replace(/`http:\/\/localhost:5000\/api\/v1(.*?)`/g, '\`${process.env.NEXT_PUBLIC_API_URL || \'http://localhost:5000/api/v1\'}$1\`');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated: ' + file);
    changed++;
  }
});
console.log('Total files changed: ' + changed);
