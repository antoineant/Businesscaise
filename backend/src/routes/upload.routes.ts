import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { uploadMultiple, handleUploadError, getFileUrl } from '../middleware/upload.middleware';
import { asyncHandler } from '../middleware/errorHandler.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * Upload files
 * POST /api/upload
 */
router.post(
  '/',
  uploadMultiple,
  handleUploadError,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const fileData = req.files.map((file) => ({
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      url: getFileUrl(req, file.path),
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.status(200).json({
      message: 'Files uploaded successfully',
      files: fileData,
    });
  })
);

export default router;
