// backend/src/services/storageService.js
const { uploadsDir, ensureUploadsDir, isVercel } = require('../config/paths');
const fs = require('fs');
const path = require('path');

// Choose storage provider based on environment
const USE_CLOUD_STORAGE = process.env.USE_CLOUD_STORAGE === 'true' || isVercel;

class StorageService {
  constructor() {
    this.provider = null;
    this.initProvider();
  }

  async initProvider() {
    if (USE_CLOUD_STORAGE && process.env.CLOUDINARY_CLOUD_NAME) {
      // Use Cloudinary (free tier available)
      const cloudinary = require('cloudinary').v2;
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      this.provider = 'cloudinary';
      this.cloudinary = cloudinary;
      console.log('☁️  Using Cloudinary for file storage');
    } 
    else if (USE_CLOUD_STORAGE && process.env.AWS_BUCKET_NAME) {
      // Use AWS S3
      const AWS = require('aws-sdk');
      this.s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
      });
      this.bucket = process.env.AWS_BUCKET_NAME;
      this.provider = 's3';
      console.log('☁️  Using AWS S3 for file storage');
    }
    else {
      // Fallback to local filesystem
      ensureUploadsDir();
      this.provider = 'local';
      console.log('💾 Using local filesystem for file storage');
      if (isVercel) {
        console.warn('⚠️  Warning: Local storage on Vercel is temporary!');
      }
    }
  }

  async saveFile(fileBuffer, originalName, mimeType) {
    const timestamp = Date.now();
    const ext = path.extname(originalName);
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}${ext}`;
    
    if (this.provider === 'cloudinary') {
      return new Promise((resolve, reject) => {
        const uploadStream = this.cloudinary.uploader.upload_stream(
          {
            folder: 'roomy/uploads',
            public_id: filename.replace(ext, ''),
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve({ url: result.secure_url, filename: result.public_id });
          }
        );
        uploadStream.end(fileBuffer);
      });
    }
    
    if (this.provider === 's3') {
      const params = {
        Bucket: this.bucket,
        Key: `uploads/${filename}`,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: 'public-read',
      };
      const result = await this.s3.upload(params).promise();
      return { url: result.Location, filename: result.Key };
    }
    
    // Local storage
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, fileBuffer);
    const url = `/uploads/${filename}`;
    return { url, filename };
  }

  async deleteFile(filename) {
    if (this.provider === 'cloudinary') {
      await this.cloudinary.uploader.destroy(filename);
    }
    else if (this.provider === 's3') {
      const params = {
        Bucket: this.bucket,
        Key: filename,
      };
      await this.s3.deleteObject(params).promise();
    }
    else {
      const filePath = path.join(uploadsDir, path.basename(filename));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  getFileUrl(filename) {
    if (this.provider === 'cloudinary') {
      return this.cloudinary.url(filename);
    }
    if (this.provider === 's3') {
      return `https://${this.bucket}.s3.amazonaws.com/${filename}`;
    }
    return `/uploads/${path.basename(filename)}`;
  }
}

module.exports = new StorageService();