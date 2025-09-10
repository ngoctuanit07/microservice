// backend/src/users/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, role: 'admin' },
  });
  console.log('Seeded admin:', email, 'password: Admin@123');
}
main().finally(() => prisma.$disconnect());
