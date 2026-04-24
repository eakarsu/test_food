import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { createError } from './errorHandler';

export const authorize = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { role: true },
      });

      if (!user) {
        return next(createError('User not found', 404));
      }

      if (!roles.includes(user.role)) {
        return next(createError('Insufficient permissions', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
