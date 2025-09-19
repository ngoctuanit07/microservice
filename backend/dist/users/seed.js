"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    try {
        const adminRoleId = await prisma.$executeRaw `
      INSERT INTO Role (name, description) 
      VALUES ('admin', 'Administrator with full access')
      ON DUPLICATE KEY UPDATE 
        name = 'admin',
        description = 'Administrator with full access'
    `;
        const userRoleId = await prisma.$executeRaw `
      INSERT INTO Role (name, description) 
      VALUES ('user', 'Regular user with limited access')
      ON DUPLICATE KEY UPDATE 
        name = 'user',
        description = 'Regular user with limited access'
    `;
        const adminRole = await prisma.$queryRaw `
      SELECT * FROM Role WHERE name = 'admin' LIMIT 1
    `;
        const userRole = await prisma.$queryRaw `
      SELECT * FROM Role WHERE name = 'user' LIMIT 1
    `;
        await prisma.$executeRaw `
      INSERT INTO Permission (name, description)
      VALUES ('manage:users', 'Can create, update, and delete users')
      ON DUPLICATE KEY UPDATE 
        name = 'manage:users',
        description = 'Can create, update, and delete users'
    `;
        await prisma.$executeRaw `
      INSERT INTO Permission (name, description)
      VALUES ('read:users', 'Can read user information')
      ON DUPLICATE KEY UPDATE 
        name = 'read:users',
        description = 'Can read user information'
    `;
        const manageUsers = await prisma.$queryRaw `
      SELECT * FROM Permission WHERE name = 'manage:users' LIMIT 1
    `;
        const readUsers = await prisma.$queryRaw `
      SELECT * FROM Permission WHERE name = 'read:users' LIMIT 1
    `;
        const email = 'admin@example.com';
        const passwordHash = await bcrypt.hash('Admin@123', 10);
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            await prisma.user.update({
                where: { email },
                data: { roleId: adminRole[0].id }
            });
        }
        else {
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
    }
    catch (error) {
        console.error('Error seeding database:', error);
    }
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map