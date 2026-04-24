import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { createError } from '../middleware/errorHandler';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';

const router = Router();

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  avatar: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
};

// Get current user profile
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        ...userSelect,
        _count: { select: { posts: true, files: true } },
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update current user profile
router.put('/me', authenticateToken, async (req, res, next) => {
  try {
    const data = z
      .object({
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        avatar: z.string().optional(),
      })
      .parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data,
      select: userSelect,
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = z
      .object({ currentPassword: z.string(), newPassword: z.string().min(6) })
      .parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) throw createError('User not found', 404);

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw createError('Current password is incorrect', 400);

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

// List all users (admin, paginated, searchable, filterable, sortable)
router.get('/', authenticateToken, authorize('ADMIN'), async (req, res, next) => {
  try {
    const params = parsePagination(req);
    const where: Record<string, unknown> = {};

    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.filter?.role) {
      where.role = params.filter.role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          ...userSelect,
          _count: { select: { posts: true, files: true } },
        },
        orderBy: { [params.sortBy]: params.sortOrder },
        skip: params.skip,
        take: params.limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json(buildPaginatedResponse(users, total, params));
  } catch (error) {
    next(error);
  }
});

// Get user by ID (admin)
router.get('/:id', authenticateToken, authorize('ADMIN'), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        ...userSelect,
        _count: { select: { posts: true, files: true } },
      },
    });
    if (!user) throw createError('User not found', 404);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update user (admin)
router.put('/:id', authenticateToken, authorize('ADMIN'), async (req, res, next) => {
  try {
    const data = z
      .object({
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        role: z.enum(['USER', 'ADMIN']).optional(),
        emailVerified: z.boolean().optional(),
      })
      .parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: userSelect,
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Delete user (admin)
router.delete('/:id', authenticateToken, authorize('ADMIN'), async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
});

// Bulk delete users (admin)
router.delete('/bulk', authenticateToken, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { ids } = z.object({ ids: z.array(z.string()).min(1) }).parse(req.body);
    const result = await prisma.user.deleteMany({ where: { id: { in: ids } } });
    res.json({ message: `${result.count} users deleted` });
  } catch (error) {
    next(error);
  }
});

// Bulk update users (admin)
router.patch('/bulk', authenticateToken, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { ids, role } = z
      .object({
        ids: z.array(z.string()).min(1),
        role: z.enum(['USER', 'ADMIN']).optional(),
      })
      .parse(req.body);

    const data: Record<string, unknown> = {};
    if (role) data.role = role;

    const result = await prisma.user.updateMany({ where: { id: { in: ids } }, data });
    res.json({ message: `${result.count} users updated` });
  } catch (error) {
    next(error);
  }
});

export { router as userRoutes };
