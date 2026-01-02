import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/profiles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage - use memory storage first for validation
const storage = multer.memoryStorage();

// File filter - basic MIME type check (will also validate content after)
const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

// Create multer instance with memory storage
export const uploadProfilePicture = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1
  }
});

// Validate actual file content by checking magic bytes
export const validateImageContent = (buffer: Buffer): { valid: boolean; format: string; error?: string } => {
  // Check magic bytes for different image formats
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { valid: true, format: 'jpg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { valid: true, format: 'png' };
  }

  // GIF: 47 49 46 38 (GIF8)
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return { valid: true, format: 'gif' };
  }

  // WebP: 52 49 46 46 ... 57 45 42 50 (RIFF....WEBP)
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return { valid: true, format: 'webp' };
  }

  // HEIC/HEIF: Check for 'ftyp' box with heic/heix/hevc/hevx brands
  // Format: [size][ftyp][brand]
  if (buffer.length > 12) {
    const ftypPos = buffer.indexOf('ftyp');
    if (ftypPos !== -1 && ftypPos < 12) {
      const brand = buffer.slice(ftypPos + 4, ftypPos + 8).toString();
      if (['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'mif1'].includes(brand)) {
        return {
          valid: false,
          format: 'heic',
          error: 'HEIC/HEIF images are not supported. Please convert to JPEG or PNG before uploading.'
        };
      }
    }
  }

  return {
    valid: false,
    format: 'unknown',
    error: 'Invalid image format. Please upload a JPEG, PNG, GIF, or WebP image.'
  };
};

// Save validated image to disk
export const saveProfilePicture = (buffer: Buffer, format: string): string => {
  const uniqueSuffix = crypto.randomBytes(16).toString('hex');
  const filename = `${uniqueSuffix}.${format}`;
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, buffer);
  return filename;
};

// Helper to delete old profile picture
export const deleteProfilePicture = (filename: string | null): void => {
  if (filename) {
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

// Get the uploads directory path
export const getUploadsDir = (): string => uploadsDir;
