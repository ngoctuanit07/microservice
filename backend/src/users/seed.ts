// backend/src/users/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  try {
    // Create roles using raw SQL since the models might not be available yet
    const adminRoleId = await prisma.$executeRaw`
      INSERT INTO Role (name, description) 
      VALUES ('admin', 'Administrator with full access')
      ON DUPLICATE KEY UPDATE 
        name = 'admin',
        description = 'Administrator with full access'
    `;

    const userRoleId = await prisma.$executeRaw`
      INSERT INTO Role (name, description) 
      VALUES ('user', 'Regular user with limited access')
      ON DUPLICATE KEY UPDATE 
        name = 'user',
        description = 'Regular user with limited access'
    `;
    
    // Get the role IDs
    const adminRole: any = await prisma.$queryRaw`
      SELECT * FROM Role WHERE name = 'admin' LIMIT 1
    `;
    
    const userRole: any = await prisma.$queryRaw`
      SELECT * FROM Role WHERE name = 'user' LIMIT 1
    `;
    
    // Create permissions
    await prisma.$executeRaw`
      INSERT INTO Permission (name, description)
      VALUES ('manage:users', 'Can create, update, and delete users')
      ON DUPLICATE KEY UPDATE 
        name = 'manage:users',
        description = 'Can create, update, and delete users'
    `;
    
    await prisma.$executeRaw`
      INSERT INTO Permission (name, description)
      VALUES ('read:users', 'Can read user information')
      ON DUPLICATE KEY UPDATE 
        name = 'read:users',
        description = 'Can read user information'
    `;
    
    // Get permissions
    const manageUsers = await prisma.$queryRaw`
      SELECT * FROM Permission WHERE name = 'manage:users' LIMIT 1
    `;
    
    const readUsers = await prisma.$queryRaw`
      SELECT * FROM Permission WHERE name = 'read:users' LIMIT 1
    `;

    // Create admin user
    const email = 'admin@example.com';
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      // Update user to use the admin role
      await prisma.user.update({
        where: { email },
        data: { roleId: adminRole[0].id }
      });
    } else {
      // Create new admin user
      await prisma.user.create({
        data: {
          email,
          passwordHash,
          roleId: adminRole[0].id
        }
      });
    }
    
    console.log('Seeded roles, permissions, and admin user');
    console.log('Admin:', email, 'password: Admin@123');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

main().finally(() => prisma.$disconnect());
