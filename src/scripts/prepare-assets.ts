import * as fs from 'fs';
import * as path from 'path';
import Jimp from 'jimp';

async function prepareAssets() {
  const destDir = path.join(process.cwd(), 'assets');
  console.log('Ensuring root assets/ directory exists at:', destDir);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  console.log('Generating high-resolution 1024x1024 App Icon...');
  
  // 1. Create 1024x1024 Master Icon
  const masterIcon = new Jimp(1024, 1024);
  
  // Fill with an elegant radial gradient: Rich Blue (#2563EB) at center to Deep Blue-900 (#1E3A8A) at corners
  const centerX = 512;
  const centerY = 512;
  const maxDist = Math.sqrt(512 * 512 + 512 * 512);

  for (let x = 0; x < 1024; x++) {
    for (let y = 0; y < 1024; y++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ratio = Math.min(dist / maxDist, 1.0);
      
      // Interpolate colors from #2563eb (37, 99, 235) to #1e3a8a (30, 58, 138)
      const r = Math.round(37 * (1 - ratio) + 30 * ratio);
      const g = Math.round(99 * (1 - ratio) + 58 * ratio);
      const b = Math.round(235 * (1 - ratio) + 138 * ratio);
      
      const color = Jimp.rgbaToInt(r, g, b, 255);
      masterIcon.setPixelColor(color, x, y);
    }
  }

  // Draw a subtle golden-yellow glowing border ring in the icon
  for (let x = 0; x < 1024; x++) {
    for (let y = 0; y < 1024; y++) {
      const dx = x - 512;
      const dy = y - 512;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Draw outer circle with radius between 420 and 440
      if (dist >= 420 && dist <= 440) {
        const borderAlpha = Math.round(255 * (1 - Math.abs(dist - 430) / 10));
        const color = Jimp.rgbaToInt(245, 158, 11, borderAlpha); // Amber 500
        masterIcon.setPixelColor(color, x, y);
      }
    }
  }

  // Draw centralized "EZ" text
  console.log('Printing "EZ" text on Master Icon...');
  const font64 = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
  
  // Create a temporary text stamp image to resize text for ultra-crisp display in 1024x1024 resolution
  const textStamp = new Jimp(300, 150);
  textStamp.print(font64, 0, 0, {
    text: 'EZ',
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
  }, 300, 150);
  
  // Resize the stamp so that the text "EZ" renders very large and beautiful
  textStamp.resize(600, 300);
  
  // Composite "EZ" text stamp onto the center of the icon
  masterIcon.blit(textStamp, 512 - 300, 512 - 250);

  // Draw a stunning emerald green checkmark symbol geometrically
  console.log('Drawing elegant checkmark on Master Icon...');
  // The center is (512, 512). Let's draw checkmark below the text (around y = 600 to 750)
  // Left wing: from (400, 680) to (480, 760)
  // Right wing: from (480, 760) to (650, 590)
  const lineThickness = 28;
  for (let t = -lineThickness; t <= lineThickness; t++) {
    // left segment of checkmark
    for (let i = 0; i <= 80; i++) {
      const px = Math.round(400 + i);
      const py = Math.round(680 + i + t);
      if (px >= 0 && px < 1024 && py >= 0 && py < 1024) {
        masterIcon.setPixelColor(0x10b981ff, px, py); // Emerald Green
      }
    }
    // right segment of checkmark
    for (let i = 0; i <= 170; i++) {
      const px = Math.round(480 + i);
      const py = Math.round(760 - i + t);
      if (px >= 0 && px < 1024 && py >= 0 && py < 1024) {
        masterIcon.setPixelColor(0x10b981ff, px, py); // Emerald Green
      }
    }
  }

  // Save master icon.png & icon-only.png
  const destIcon = path.join(destDir, 'icon.png');
  const destIconOnly = path.join(destDir, 'icon-only.png');
  await masterIcon.writeAsync(destIcon);
  await masterIcon.writeAsync(destIconOnly);
  console.log('✓ Successfully saved assets/icon.png and assets/icon-only.png!');

  // 2. Generate 2732x2732 Splash Screen
  console.log('Generating high-resolution 2732x2732 Splash Screen...');
  const splash = new Jimp(2732, 2732);
  
  // Fill splash with clean rich indigo background gradient
  const splashCenterX = 1366;
  const splashCenterY = 1366;
  const splashMaxDist = Math.sqrt(1366 * 1366 + 1366 * 1366);

  for (let x = 0; x < 2732; x++) {
    for (let y = 0; y < 2732; y++) {
      const dx = x - splashCenterX;
      const dy = y - splashCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ratio = Math.min(dist / splashMaxDist, 1.0);
      
      // Interpolate colors from #1E3A8A (30, 58, 138) to Slate-900 (15, 23, 42)
      const r = Math.round(30 * (1 - ratio) + 15 * ratio);
      const g = Math.round(58 * (1 - ratio) + 23 * ratio);
      const b = Math.round(138 * (1 - ratio) + 42 * ratio);
      
      const color = Jimp.rgbaToInt(r, g, b, 255);
      splash.setPixelColor(color, x, y);
    }
  }

  // Resize a copy of the master icon to around 512x512 to center on the splash screen
  console.log('Centering custom logo onto Splash Screen...');
  const logoForSplash = masterIcon.clone().resize(512, 512);
  
  // Composite centered logo
  splash.blit(logoForSplash, 1366 - 256, 1366 - 256);

  // Save splash.png
  const destSplash = path.join(destDir, 'splash.png');
  await splash.writeAsync(destSplash);
  console.log('✓ Successfully saved assets/splash.png!');
  
  console.log('All launcher assets generated perfectly!');
}

prepareAssets().catch(err => {
  console.error('Fatal: Failed to generate premium app assets:', err);
  process.exit(1);
});
