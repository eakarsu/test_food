import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authenticateToken } from '../middleware/auth';
import { config } from '../config/config';
import { createError } from '../middleware/errorHandler';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';

const router = Router();

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSize },
  fileFilter: (req, file, cb) => {
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

// Get all files (paginated, searchable, sortable)
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const params = parsePagination(req);
    const where: Record<string, unknown> = {};

    // Non-admins only see their own files
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true },
    });
    if (user?.role !== 'ADMIN') {
      where.userId = req.user.userId;
    }

    if (params.search) {
      where.originalName = { contains: params.search, mode: 'insensitive' };
    }
    if (params.filter?.mimetype) {
      where.mimetype = { contains: params.filter.mimetype };
    }

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where,
        include: { uploadedBy: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { [params.sortBy]: params.sortOrder },
        skip: params.skip,
        take: params.limit,
      }),
      prisma.file.count({ where }),
    ]);

    res.json(buildPaginatedResponse(files, total, params));
  } catch (error) {
    next(error);
  }
});

// Get file by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.id },
      include: { uploadedBy: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!file) throw createError('File not found', 404);

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true },
    });
    if (file.userId !== req.user.userId && user?.role !== 'ADMIN') {
      throw createError('Not authorized', 403);
    }

    res.json(file);
  } catch (error) {
    next(error);
  }
});

// Upload file
router.post('/upload', authenticateToken, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) throw createError('No file uploaded', 400);

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

// Get user's files (legacy endpoint)
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

// Delete file
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    if (!file) throw createError('File not found', 404);

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true },
    });
    if (file.userId !== req.user.userId && user?.role !== 'ADMIN') {
      throw createError('Not authorized', 403);
    }

    // Delete physical file
    try {
      fs.unlinkSync(file.path);
    } catch {
      // File may already be gone
    }

    await prisma.file.delete({ where: { id: req.params.id } });
    res.json({ message: 'File deleted' });
  } catch (error) {
    next(error);
  }
});

// Bulk delete files
router.delete('/bulk', authenticateToken, async (req, res, next) => {
  try {
    const { ids } = z.object({ ids: z.array(z.string()).min(1) }).parse(req.body);

    // Get file paths before deleting
    const files = await prisma.file.findMany({
      where: { id: { in: ids }, userId: req.user.userId },
      select: { path: true },
    });

    const result = await prisma.file.deleteMany({
      where: { id: { in: ids }, userId: req.user.userId },
    });

    // Clean up physical files
    files.forEach((f) => {
      try {
        fs.unlinkSync(f.path);
      } catch {
        // ignore
      }
    });

    res.json({ message: `${result.count} files deleted` });
  } catch (error) {
    next(error);
  }
});

export { router as fileRoutes };
