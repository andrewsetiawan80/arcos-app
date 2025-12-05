import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const svgBuffer = readFileSync(join(publicDir, 'favicon.svg'));

async function generateFavicons() {
  // Generate 32x32 favicon
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(join(publicDir, 'favicon-32.png'));
  console.log('✅ Generated favicon-32.png');

  // Generate 180x180 apple touch icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(join(publicDir, 'apple-touch-icon.png'));
  console.log('✅ Generated apple-touch-icon.png');

  // Generate 192x192 for PWA
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(join(publicDir, 'icon-192.png'));
  console.log('✅ Generated icon-192.png');

  // Generate 512x512 for PWA
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(join(publicDir, 'icon-512.png'));
  console.log('✅ Generated icon-512.png');

  console.log('🎉 All favicons generated!');
}

generateFavicons().catch(console.error);

