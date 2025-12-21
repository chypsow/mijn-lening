const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

(async () => {
  const iconsDir = path.join(__dirname, '..', 'images', 'icons');
  const svg192 = path.join(iconsDir, 'icon-192.svg');
  const svg512 = path.join(iconsDir, 'icon-512.svg');

  if (!fs.existsSync(svg192) || !fs.existsSync(svg512)) {
    console.error('SVG icon files not found in images/icons.');
    process.exit(1);
  }

  try {
    await sharp(svg192)
      .png({ quality: 90 })
      .toFile(path.join(iconsDir, 'icon-192.png'));
    console.log('Wrote icon-192.png');

    await sharp(svg512)
      .png({ quality: 90 })
      .toFile(path.join(iconsDir, 'icon-512.png'));
    console.log('Wrote icon-512.png');
  } catch (err) {
    console.error('Error converting icons:', err);
    process.exit(1);
  }
})();
