import { z } from 'zod';

const configSchema = z.object({
  port: z.number().default(3001),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  databaseUrl: z.string(),
  jwtSecret: z.string(),
  jwtExpiresIn: z.string().default('7d'),
  corsOrigin: z.string().default('http://localhost:3000'),
  maxFileSize: z.number().default(5 * 1024 * 1024), // 5MB
  uploadDir: z.string().default('uploads'),
  smtpHost: z.string().optional(),
  smtpPort: z.number().default(587),
  smtpUser: z.string().optional(),
  smtpPass: z.string().optional(),
  appUrl: z.string().default('http://localhost:3000'),
});

const env = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'),
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  smtpHost: process.env.SMTP_HOST || undefined,
  smtpPort: parseInt(process.env.SMTP_PORT || '587'),
  smtpUser: process.env.SMTP_USER || undefined,
  smtpPass: process.env.SMTP_PASS || undefined,
  appUrl: process.env.APP_URL || 'http://localhost:3000',
};

export const config = configSchema.parse(env);
