const fs = require('fs');
const path = require('path');

const saveBase64Image = ({ image, uploadsDir }) => {
  if (!image || !String(image).startsWith('data:image/')) {
    const error = new Error('Invalid image data.');
    error.status = 400;
    throw error;
  }

  const matches = String(image).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\r\n]+)$/);
  if (!matches) {
    const error = new Error('Invalid image format.');
    error.status = 400;
    throw error;
  }

  const mimeType = matches[1].toLowerCase();
  const mimeToExt = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
    'image/bmp': 'bmp',
    'image/heic': 'heic',
    'image/heif': 'heif',
    'image/heic-sequence': 'heic',
    'image/heif-sequence': 'heif',
    'image/tiff': 'tiff',
    'image/svg+xml': 'svg',
    'image/x-icon': 'ico',
    'image/vnd.microsoft.icon': 'ico',
  };

  const ext = mimeToExt[mimeType] || 'img';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const filepath = path.join(uploadsDir, filename);
  const normalizedBase64 = matches[2].replace(/\s+/g, '');

  fs.writeFileSync(filepath, Buffer.from(normalizedBase64, 'base64'));
  return `/uploads/${filename}`;
};

module.exports = {
  saveBase64Image,
};
