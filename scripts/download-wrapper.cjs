const fs = require('fs');
const https = require('https');
const path = require('path');

const jarUrl = 'https://raw.githubusercontent.com/android/architecture-samples/main/gradle/wrapper/gradle-wrapper.jar';
const destPath = path.join(__dirname, '../android/gradle/wrapper/gradle-wrapper.jar');

console.log('Downloading valid gradle-wrapper.jar from:', jarUrl);
console.log('Target destination:', destPath);

https.get(jarUrl, (res) => {
  if (res.statusCode !== 200) {
    console.error('Failed to download wrapper jar. Status code:', res.statusCode);
    process.exit(1);
  }

  const fileStream = fs.createWriteStream(destPath);
  res.pipe(fileStream);

  fileStream.on('finish', () => {
    fileStream.close();
    console.log('Successfully saved valid gradle-wrapper.jar!');
    
    // Check file stats
    const stats = fs.statSync(destPath);
    console.log(`File size: ${stats.size} bytes`);
  });
}).on('error', handleError);

function handleError(err) {
  console.error('Error downloading:', err.message);
  process.exit(1);
}
