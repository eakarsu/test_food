import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { config } from '../config/config';
import { createError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Upload file
router.post('/upload', authenticateToken, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw createError('No file uploaded', 400);
    }

    const file = await prisma.file.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        userId: req.user.userId,
      },
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        size: file.size,
        url: `/uploads/${file.filename}`,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get user's files
router.get('/my-files', authenticateToken, async (req, res, next) => {
  try {
    const files = await prisma.file.findMany({
      where: { userId: req.user.userId },
      select: {
        id: true,
        filename: true,
        originalName: true,
        size: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(files);
  } catch (error) {
    next(error);
  }
});

export { router as fileRoutes };
