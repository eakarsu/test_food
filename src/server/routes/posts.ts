import { Router } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authenticateToken } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';

const router = Router();

const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  published: z.boolean().default(false),
});

const authorSelect = {
  id: true,
  firstName: true,
  lastName: true,
};

// Get all posts (paginated, searchable, filterable, sortable)
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const params = parsePagination(req);
    const where: Record<string, unknown> = {};

    // Show all posts for the authenticated user (their own + published by others)
    // or admin can see all
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      where.OR = [{ authorId: req.user.userId }, { published: true }];
    }

    if (params.search) {
      const searchCondition = {
        OR: [
          { title: { contains: params.search, mode: 'insensitive' as const } },
          { content: { contains: params.search, mode: 'insensitive' as const } },
        ],
      };
      if (where.OR) {
        where.AND = [{ OR: where.OR as unknown[] }, searchCondition];
        delete where.OR;
      } else {
        where.OR = searchCondition.OR;
      }
    }

    if (params.filter?.published) {
      where.published = params.filter.published === 'true';
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: { author: { select: authorSelect } },
        orderBy: { [params.sortBy]: params.sortOrder },
        skip: params.skip,
        take: params.limit,
      }),
      prisma.post.count({ where }),
    ]);

    res.json(buildPaginatedResponse(posts, total, params));
  } catch (error) {
    next(error);
  }
});

// Get post by ID
router.get('/by-id/:id', authenticateToken, async (req, res, next) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: { author: { select: authorSelect } },
    });
    if (!post) throw createError('Post not found', 404);
    res.json(post);
  } catch (error) {
    next(error);
  }
});

// Get single post by slug
router.get('/:slug', async (req, res, next) => {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: req.params.slug },
      include: { author: { select: authorSelect } },
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (error) {
    next(error);
  }
});

// Create new post
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { title, content, excerpt, published } = createPostSchema.parse(req.body);
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const post = await prisma.post.create({
      data: { title, content, excerpt, slug, published, authorId: req.user.userId },
      include: { author: { select: authorSelect } },
    });

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

// Update post
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const existing = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!existing) throw createError('Post not found', 404);

    // Check ownership or admin
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true },
    });
    if (existing.authorId !== req.user.userId && user?.role !== 'ADMIN') {
      throw createError('Not authorized', 403);
    }

    const data = z
      .object({
        title: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        excerpt: z.string().optional(),
        published: z.boolean().optional(),
      })
      .parse(req.body);

    const post = await prisma.post.update({
      where: { id: req.params.id },
      data,
      include: { author: { select: authorSelect } },
    });
    res.json(post);
  } catch (error) {
    next(error);
  }
});

// Delete post
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const existing = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!existing) throw createError('Post not found', 404);

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true },
    });
    if (existing.authorId !== req.user.userId && user?.role !== 'ADMIN') {
      throw createError('Not authorized', 403);
    }

    await prisma.post.delete({ where: { id: req.params.id } });
    res.json({ message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
});

// Bulk delete posts
router.delete('/bulk', authenticateToken, async (req, res, next) => {
  try {
    const { ids } = z.object({ ids: z.array(z.string()).min(1) }).parse(req.body);
    const result = await prisma.post.deleteMany({
      where: { id: { in: ids }, authorId: req.user.userId },
    });
    res.json({ message: `${result.count} posts deleted` });
  } catch (error) {
    next(error);
  }
});

// Bulk update posts
router.patch('/bulk', authenticateToken, async (req, res, next) => {
  try {
    const { ids, published } = z
      .object({
        ids: z.array(z.string()).min(1),
        published: z.boolean().optional(),
      })
      .parse(req.body);

    const data: Record<string, unknown> = {};
    if (published !== undefined) data.published = published;

    const result = await prisma.post.updateMany({
      where: { id: { in: ids }, authorId: req.user.userId },
      data,
    });
    res.json({ message: `${result.count} posts updated` });
  } catch (error) {
    next(error);
  }
});

export { router as postRoutes };
