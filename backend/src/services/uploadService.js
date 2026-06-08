const fs = require('fs');
const path = require('path');
const storageService = require('./storageService');

const parseBase64Image = (image) => {
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

  return {
    mimeType: matches[1].toLowerCase(),
    normalizedBase64: matches[2].replace(/\s+/g, ''),
  };
};

const saveBase64Image = async ({ image, uploadsDir }) => {
  const { mimeType, normalizedBase64 } = parseBase64Image(image);

  // Vercel local filesystem is ephemeral. Without cloud storage configured,
  // keep a durable reference by storing the data URI directly in CMS data.
  if (process.env.VERCEL && !process.env.CLOUDINARY_CLOUD_NAME && !process.env.AWS_BUCKET_NAME) {
    return String(image);
  }

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
  const originalName = `upload.${ext}`;
  const fileBuffer = Buffer.from(normalizedBase64, 'base64');

  // Prefer configured cloud storage providers.
  const saved = await storageService.saveFile(fileBuffer, originalName, mimeType);
  if (saved?.url) {
    return saved.url;
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const filepath = path.join(uploadsDir, filename);

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  fs.writeFileSync(filepath, fileBuffer);
  return `/uploads/${filename}`;
};

module.exports = {
  saveBase64Image,
};
