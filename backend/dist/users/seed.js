"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
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
//# sourceMappingURL=seed.js.map