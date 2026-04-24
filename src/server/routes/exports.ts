import { Router } from 'express';
import PDFDocument from 'pdfkit';
import prisma from '../utils/prisma';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

// CSV helper
function toCsv(headers: string[], rows: string[][]): string {
  const escape = (val: string) => `"${String(val).replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(',')];
  rows.forEach((row) => lines.push(row.map(escape).join(',')));
  return lines.join('\n');
}

// Posts CSV
router.get('/posts/csv', authenticateToken, async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      include: { author: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const csv = toCsv(
      ['ID', 'Title', 'Author', 'Published', 'Created At'],
      posts.map((p) => [
        p.id,
        p.title,
        `${p.author.firstName} ${p.author.lastName}`,
        String(p.published),
        p.createdAt.toISOString(),
      ])
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=posts.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

// Posts PDF
router.get('/posts/pdf', authenticateToken, async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      include: { author: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=posts.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('Posts Report', { align: 'center' });
    doc.moveDown();

    posts.forEach((p) => {
      doc.fontSize(14).text(p.title);
      doc.fontSize(10).text(
        `Author: ${p.author.firstName} ${p.author.lastName} | Published: ${p.published} | ${p.createdAt.toISOString().split('T')[0]}`
      );
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    next(error);
  }
});

// Users CSV (admin only)
router.get('/users/csv', authenticateToken, authorize('ADMIN'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const csv = toCsv(
      ['ID', 'Email', 'First Name', 'Last Name', 'Role', 'Created At'],
      users.map((u) => [u.id, u.email, u.firstName, u.lastName, u.role, u.createdAt.toISOString()])
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

// Users PDF (admin only)
router.get('/users/pdf', authenticateToken, authorize('ADMIN'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { email: true, firstName: true, lastName: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=users.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('Users Report', { align: 'center' });
    doc.moveDown();

    users.forEach((u) => {
      doc.fontSize(12).text(`${u.firstName} ${u.lastName} (${u.email})`);
      doc.fontSize(10).text(`Role: ${u.role} | Joined: ${u.createdAt.toISOString().split('T')[0]}`);
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    next(error);
  }
});

// Files CSV
router.get('/files/csv', authenticateToken, async (req, res, next) => {
  try {
    const files = await prisma.file.findMany({
      where: { userId: req.user.userId },
      include: { uploadedBy: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const csv = toCsv(
      ['ID', 'Original Name', 'Type', 'Size (bytes)', 'Uploaded By', 'Created At'],
      files.map((f) => [
        f.id,
        f.originalName,
        f.mimetype,
        String(f.size),
        `${f.uploadedBy.firstName} ${f.uploadedBy.lastName}`,
        f.createdAt.toISOString(),
      ])
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=files.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

// Files PDF
router.get('/files/pdf', authenticateToken, async (req, res, next) => {
  try {
    const files = await prisma.file.findMany({
      where: { userId: req.user.userId },
      include: { uploadedBy: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=files.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('Files Report', { align: 'center' });
    doc.moveDown();

    files.forEach((f) => {
      doc.fontSize(12).text(f.originalName);
      doc.fontSize(10).text(
        `Type: ${f.mimetype} | Size: ${(f.size / 1024).toFixed(1)} KB | ${f.createdAt.toISOString().split('T')[0]}`
      );
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    next(error);
  }
});

export { router as exportRoutes };
