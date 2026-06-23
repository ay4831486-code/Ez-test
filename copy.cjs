const fs = require('fs');
const path = require('path');

const srcIcon = path.join(__dirname, 'assets', 'icon.png');
const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

if (fs.existsSync(srcIcon)) {
  fs.copyFileSync(srcIcon, path.join(publicDir, 'icon.png'));
  fs.copyFileSync(srcIcon, path.join(publicDir, 'icon-192.png'));
  fs.copyFileSync(srcIcon, path.join(publicDir, 'icon-512.png'));
  console.log('Icons copied successfully.');
} else {
  console.log('assets/icon.png does not exist.');
}
