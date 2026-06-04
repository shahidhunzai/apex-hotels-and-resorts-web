const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../..');
const dataDir = path.join(rootDir, 'data');
const bookingsFile = path.join(dataDir, 'bookings.json');
const cmsFile = path.join(dataDir, 'cms.json');
const uploadsDir = path.join(rootDir, 'uploads');

const ensureUploadsDir = () => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
};

const ensureDataDir = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

module.exports = {
  rootDir,
  dataDir,
  bookingsFile,
  cmsFile,
  uploadsDir,
  ensureUploadsDir,
  ensureDataDir,
};
