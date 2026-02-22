
const fs = require('fs');
const path = require('path');

const srcPath = path.join(process.cwd(), 'node_modules/lamejs/lame.all.js');
const destPath = path.join(process.cwd(), 'src/lib/lame.js');

try {
  let content = fs.readFileSync(srcPath, 'utf8');
  
  // Remove the last line if it's just a newline or empty
  content = content.trim();

  // Append exports
  const newContent = content + '\n\nexport const Mp3Encoder = lamejs.Mp3Encoder;\nexport const WavHeader = lamejs.WavHeader;\n';
  
  fs.writeFileSync(destPath, newContent);
  console.log('Successfully copied and modified lame.js');
} catch (err) {
  console.error('Error copying lame.js:', err);
  process.exit(1);
}
