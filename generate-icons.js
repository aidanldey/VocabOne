/**
 * Script to generate PNG icons from SVG source
 * Generates regular and maskable icons in required sizes
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgPath = join(__dirname, 'public', 'icon.svg');
const publicDir = join(__dirname, 'public');

// Read the SVG file
const svgBuffer = readFileSync(svgPath);

// Generate icon sizes
const sizes = [192, 512];

async function generateIcons() {
  console.log('Generating PWA icons...\n');

  for (const size of sizes) {
    // Generate regular icon
    const regularPath = join(publicDir, `pwa-${size}x${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(regularPath);
    console.log(`✓ Generated ${regularPath}`);

    // Generate maskable icon (with padding for safe area)
    // Maskable icons need 40% minimum safe area, so we'll resize the icon to 60% of canvas
    const iconSize = Math.round(size * 0.6);
    const padding = Math.round((size - iconSize) / 2);

    const maskablePath = join(publicDir, `pwa-maskable-${size}x${size}.png`);
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 249, g: 115, b: 22, alpha: 1 } // #f97316 orange
      }
    })
      .composite([
        {
          input: await sharp(svgBuffer)
            .resize(iconSize, iconSize)
            .png()
            .toBuffer(),
          top: padding,
          left: padding
        }
      ])
      .png()
      .toFile(maskablePath);
    console.log(`✓ Generated ${maskablePath}`);
  }

  console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
