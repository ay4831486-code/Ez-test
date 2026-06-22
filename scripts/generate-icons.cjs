const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Install jimp dynamically if not available
try {
  require.resolve('jimp');
} catch (e) {
  console.log('Installing jimp dependency for professional PWA asset generation...');
  execSync('npm install jimp@0.16.1', { stdio: 'inherit' });
}

const Jimp = require('jimp');

async function main() {
  console.log('Generating PWA Icons and Mock Screenshots...');

  // Create solid beautiful background with academic icons
  // Primary colors: Deep indigo (#1e1b4b) / Blue (#2563eb) / Emerald accent (#059669)
  
  // 1. Generate 512x512 App Icon
  const icon512 = new Jimp(512, 512, 0x1e1b4bff); // Rich Indigo dark background
  
  // Draw an outer glowing circle
  for (let x = 0; x < 512; x++) {
    for (let y = 0; y < 512; y++) {
      const dx = x - 256;
      const dy = y - 256;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 180 && dist < 210) {
        // glowing circle bordure
        icon512.setPixelColor(0x3b82f6ff, x, y); // Blue-500
      } else if (dist <= 180) {
        // inner ring gradient
        const factor = (180 - dist) / 180;
        const color = Jimp.rgbaToInt(
          Math.min(30 + factor * 20, 255),
          Math.min(27 + factor * 60, 255),
          Math.min(75 + factor * 140, 255),
          255
        );
        icon512.setPixelColor(color, x, y);
      }
    }
  }

  // Load a font to draw "EZ Test" text
  const font64 = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
  const font32 = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  
  // Draw centralized "EZ" and "TEST"
  icon512.print(font64, 180, 180, {
    text: 'EZ',
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
  }, 150, 80);

  icon512.print(font32, 180, 260, {
    text: 'TEST',
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
  }, 150, 50);

  // Draw checkmark symbol inside the icon manually (emerald green check)
  // Checkmark coordinates: starting at (200, 340) -> to (240, 380) -> to (320, 300)
  for (let t = -3; t <= 3; t++) {
    // left segment of checkmark
    for (let i = 0; i <= 40; i++) {
      const px = 200 + i;
      const py = 330 + i + t;
      if (px >= 0 && px < 512 && py >= 0 && py < 512) {
        icon512.setPixelColor(0x10b981ff, px, py); // Emerald
      }
    }
    // right segment of checkmark
    for (let i = 0; i <= 80; i++) {
      const px = 240 + i;
      const py = 370 - i + t;
      if (px >= 0 && px < 512 && py >= 0 && py < 512) {
        icon512.setPixelColor(0x10b981ff, px, py); // Emerald
      }
    }
  }

  await icon512.writeAsync(path.join(__dirname, '../public/icon-512.png'));
  console.log('✓ Created public/icon-512.png');

  // 2. Generate 192x192 App Icon
  const icon192 = icon512.clone().resize(192, 192);
  await icon192.writeAsync(path.join(__dirname, '../public/icon-192.png'));
  console.log('✓ Created public/icon-192.png');

  // 3. Generate Desktop Mockup Screenshot (1280x720)
  const screenshotDesktop = new Jimp(1280, 720, 0x0f172aff); // Slate 900
  
  // Render a mock dashboard graphic inside the screenshot (PWA look & feel)
  // Sidebar mockup
  for (let x = 0; x < 240; x++) {
    for (let y = 0; y < 720; y++) {
      screenshotDesktop.setPixelColor(0x1e293bff, x, y); // Slate 800 sidebar
    }
  }
  
  // Draw simple sidebar links
  screenshotDesktop.print(font32, 20, 40, 'EZ TEST PWA');
  screenshotDesktop.print(font32, 20, 120, '• Dashboard');
  screenshotDesktop.print(font32, 20, 180, '• Live Assessment');
  screenshotDesktop.print(font32, 20, 240, '• Practice Labs');
  screenshotDesktop.print(font32, 20, 300, '• Chatbot Hub');

  // Header mockup
  for (let x = 240; x < 1280; x++) {
    for (let y = 0; y < 70; y++) {
      screenshotDesktop.setPixelColor(0x1e293bff, x, y);
    }
  }
  screenshotDesktop.print(font32, 270, 20, 'Coaching Institute Testing Platform');

  // Bento metric cards in screenshot
  // Metrics backgrounds
  for (let c = 0; c < 3; c++) {
    const startX = 270 + c * 320;
    for (let x = startX; x < startX + 300; x++) {
      for (let y = 110; y < 240; y++) {
        screenshotDesktop.setPixelColor(0x1e291bff + (c * 100), x, y); // Gradients or distinct backgrounds
      }
    }
  }
  
  screenshotDesktop.print(font32, 290, 130, 'Best Rank: #1');
  screenshotDesktop.print(font32, 610, 130, 'Accuracy: 94%');
  screenshotDesktop.print(font32, 930, 130, 'Tests Done: 14');

  await screenshotDesktop.writeAsync(path.join(__dirname, '../public/screenshot-desktop.png'));
  console.log('✓ Created public/screenshot-desktop.png');

  // 4. Generate Mobile Mockup Screenshot (720x1280)
  const screenshotMobile = new Jimp(720, 1280, 0x0f172aff); // Slate 900
  
  // Draw headers and status bar
  for (let x = 0; x < 720; x++) {
    for (let y = 0; y < 90; y++) {
      screenshotMobile.setPixelColor(0x1e293bff, x, y);
    }
  }
  screenshotMobile.print(font32, 30, 30, 'EZ TEST - PWA Mobile');

  // Draw bento list contents in mobile view
  for (let c = 0; c < 4; c++) {
    const startY = 140 + c * 240;
    for (let x = 40; x < 680; x++) {
      for (let y = startY; y < startY + 210; y++) {
        screenshotMobile.setPixelColor(0x1e293bff, x, y);
      }
    }
  }

  screenshotMobile.print(font32, 70, 180, '📊 Live Mock Exams (Active)');
  screenshotMobile.print(font32, 70, 420, '🧠 OMR Evaluation Sheet');
  screenshotMobile.print(font32, 70, 660, '💬 Ask Gemini Study Bud');
  screenshotMobile.print(font32, 70, 900, '⭐ Detailed Performance');

  await screenshotMobile.writeAsync(path.join(__dirname, '../public/screenshot-mobile.png'));
  console.log('✓ Created public/screenshot-mobile.png');

  console.log('All PWA assets successfully generated!');
}

main().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
