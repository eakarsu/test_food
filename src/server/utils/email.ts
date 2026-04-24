import nodemailer from 'nodemailer';
import { config } from '../config/config';
import { logger } from './logger';

let transporter: nodemailer.Transporter;

async function getTransporter() {
  if (transporter) return transporter;

  if (config.smtpHost) {
    transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
  } else {
    // Use Ethereal for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    logger.info(`Ethereal email account: ${testAccount.user}`);
  }

  return transporter;
}

export async function sendEmail(to: string, subject: string, html: string) {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: `"Modern Website" <noreply@example.com>`,
    to,
    subject,
    html,
  });
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    logger.info(`Email preview: ${previewUrl}`);
  }
  return info;
}

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${config.appUrl}/verify-email?token=${token}`;
  await sendEmail(
    email,
    'Verify your email',
    `<p>Click <a href="${url}">here</a> to verify your email.</p><p>Or copy this link: ${url}</p>`
  );
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${config.appUrl}/reset-password?token=${token}`;
  await sendEmail(
    email,
    'Reset your password',
    `<p>Click <a href="${url}">here</a> to reset your password.</p><p>Or copy this link: ${url}</p><p>This link expires in 1 hour.</p>`
  );
}
