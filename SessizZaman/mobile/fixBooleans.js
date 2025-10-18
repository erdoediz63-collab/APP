const fs = require('fs');
const path = require('path');

function fixBooleanProps(dir) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fixBooleanProps(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');

      // Only replace props in JSX, not JSON or JS objects
      content = content.replace(/(\s[a-zA-Z0-9]+)=["']true["']/g, '$1={true}');
      content = content.replace(/(\s[a-zA-Z0-9]+)=["']false["']/g, '$1={false}');

      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  });
}

fixBooleanProps('./src'); // Only scan src folder