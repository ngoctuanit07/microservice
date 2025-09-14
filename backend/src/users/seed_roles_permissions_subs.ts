import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Seed roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Quản trị hệ thống' },
  });
  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: { name: 'USER', description: 'Người dùng thông thường' },
  });

  // Seed permissions
  const perms = [
    { name: 'MANAGE_USERS', description: 'Quản lý người dùng' },
    { name: 'MANAGE_SUBS', description: 'Quản lý gói thành viên' },
    { name: 'VIEW_DASHBOARD', description: 'Xem dashboard' },
    { name: 'MANAGE_TASKS', description: 'Quản lý task/board' },
  ];
  for (const perm of perms) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  // Gán quyền cho vai trò
  const allPerms = await prisma.permission.findMany();
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }
  // USER chỉ có VIEW_DASHBOARD
  const viewDash = allPerms.find(p => p.name === 'VIEW_DASHBOARD');
  if (viewDash) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: userRole.id, permissionId: viewDash.id } },
      update: {},
      create: { roleId: userRole.id, permissionId: viewDash.id },
    });
  }

  // Seed subscriptions
  await prisma.subscription.upsert({
    where: { name: 'FREE' },
    update: {},
    create: { name: 'FREE', description: 'Gói miễn phí', price: 0, duration: 0 },
  });
  await prisma.subscription.upsert({
    where: { name: 'PRO' },
    update: {},
    create: { name: 'PRO', description: 'Gói trả phí', price: 199000, duration: 30 },
  });
  await prisma.subscription.upsert({
    where: { name: 'ENTERPRISE' },
    update: {},
    create: { name: 'ENTERPRISE', description: 'Gói doanh nghiệp', price: 999000, duration: 365 },
  });

  console.log('Seeded roles, permissions, subscriptions');
}
main().finally(() => prisma.$disconnect());
