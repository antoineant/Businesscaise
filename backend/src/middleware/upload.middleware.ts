import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Ensure upload directory exists
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    // Organize by game and team
    const gameId = req.body.game_id || 'temp';
    const teamId = req.body.team_id || 'temp';
    const uploadPath = path.join(UPLOAD_DIR, gameId, teamId);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req: Request, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const sanitizedBasename = basename.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `${timestamp}-${sanitizedBasename}${ext}`;

    cb(null, filename);
  },
});

// File filter - only allow PDFs and common document types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/png',
    'image/jpeg',
    'image/jpg',
  ];

  const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5, // Maximum 5 files per submission
  },
});

// Upload configurations for different use cases
export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 5);
export const uploadFields = upload.fields([
  { name: 'document', maxCount: 1 },
  { name: 'attachments', maxCount: 4 },
]);

/**
 * Helper function to get file URL
 */
export const getFileUrl = (req: Request, filepath: string): string => {
  const protocol = req.protocol;
  const host = req.get('host');
  const relativePath = filepath.replace(UPLOAD_DIR, '').replace(/\\/g, '/');
  return `${protocol}://${host}/uploads${relativePath}`;
};

/**
 * Helper function to delete file
 */
export const deleteFile = (filepath: string): void => {
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
};

/**
 * Helper function to delete all files for a team/game
 */
export const deleteTeamFiles = (gameId: string, teamId: string): void => {
  const dirPath = path.join(UPLOAD_DIR, gameId, teamId);
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
};

/**
 * Helper function to delete all files for a game
 */
export const deleteGameFiles = (gameId: string): void => {
  const dirPath = path.join(UPLOAD_DIR, gameId);
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
};

/**
 * Helper function to get file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Middleware to handle multer errors
 */
export const handleUploadError = (err: any, req: Request, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: `File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`,
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files. Maximum 5 files per submission',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected field in file upload',
      });
    }
    return res.status(400).json({
      error: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      error: err.message || 'File upload error',
    });
  }

  next();
};
