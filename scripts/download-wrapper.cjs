const fs = require('fs');
const https = require('https');
const path = require('path');

const jarUrl = 'https://github.com/gradle/gradle/raw/v8.12.0/gradle/wrapper/gradle-wrapper.jar';
const destPath = path.join(__dirname, '../android/gradle/wrapper/gradle-wrapper.jar');

console.log('Downloading valid gradle-wrapper.jar from:', jarUrl);
console.log('Target destination:', destPath);

https.get(jarUrl, { followRedirect: true }, (res) => {
  // Handle redirects
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    console.log('Redirecting to:', res.headers.location);
    https.get(res.headers.location, (redirectRes) => {
      saveResponse(redirectRes);
    }).on('error', handleError);
  } else {
    saveResponse(res);
  }
}).on('error', handleError);

function saveResponse(response) {
  if (response.statusCode !== 200) {
    console.error('Failed to download wrapper jar. Status code:', response.statusCode);
    process.exit(1);
  }

  const fileStream = fs.createWriteStream(destPath);
  response.pipe(fileStream);

  fileStream.on('finish', () => {
    fileStream.close();
    console.log('Successfully saved valid gradle-wrapper.jar!');
    
    // Check file stats
    const stats = fs.statSync(destPath);
    console.log(`File size: ${stats.size} bytes`);
  });
}

function handleError(err) {
  console.error('Error downloading:', err.message);
  process.exit(1);
}
