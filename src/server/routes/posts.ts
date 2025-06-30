import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  published: z.boolean().default(false),
});

// Get all published posts
router.get('/', async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(posts);
  } catch (error) {
    next(error);
  }
});

// Get single post by slug
router.get('/:slug', async (req, res, next) => {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: req.params.slug },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
});

// Create new post (authenticated)
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { title, content, excerpt, published } = createPostSchema.parse(req.body);
    
    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const post = await prisma.post.create({
      data: {
        title,
        content,
        excerpt,
        slug,
        published,
        authorId: req.user.userId,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

export { router as postRoutes };
