const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const email = String(process.env.PROVISION_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.PROVISION_ADMIN_PASSWORD || '');
  const name = String(process.env.PROVISION_ADMIN_NAME || 'Runtime Administrator').trim();
  if (!email || password.length < 12) throw new Error('Acceptance administrator credentials are required');
  const [firstName, ...rest] = name.split(/\s+/);
  const lastName = rest.join(' ') || 'Administrator';
  const hash = await bcrypt.hash(password, 12);
  const prisma = new PrismaClient();
  try {
    await prisma.user.upsert({
      where: { email },
      create: { email, password: hash, firstName, lastName, role: 'ADMIN', emailVerified: true },
      update: { password: hash, firstName, lastName, role: 'ADMIN', emailVerified: true }
    });
    console.log(`Food runtime administrator ready: ${email}`);
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
