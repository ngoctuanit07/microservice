"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcryptjs");
const jwt_1 = require("@nestjs/jwt");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async validateUser(email, password) {
        try {
            const user = await this.prisma.user.findUnique({ where: { email } });
            if (!user) {
                this.logger.warn(`Login attempt with non-existent email: ${email}`);
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const ok = await bcrypt.compare(password, user.passwordHash);
            if (!ok) {
                this.logger.warn(`Failed login attempt for user: ${email}`);
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            this.logger.log(`User ${email} logged in successfully`);
            return user;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            const errMsg = (error instanceof Error) ? error.message : String(error);
            this.logger.error(`Error validating user: ${errMsg}`);
            throw new common_1.UnauthorizedException('Authentication error');
        }
    }
    async login(email, password) {
        const user = await this.validateUser(email, password);
        const payload = {
            sub: user.id,
            role: user.role,
            email: user.email,
            name: user.name ?? undefined
        };
        const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
        return {
            access_token: await this.jwt.signAsync(payload, { expiresIn }),
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name ?? undefined
            }
        };
    }
    async refreshToken(user) {
        try {
            const userRecord = await this.prisma.user.findUnique({
                where: { id: user.sub }
            });
            if (!userRecord) {
                throw new common_1.UnauthorizedException('User no longer exists');
            }
            const payload = {
                sub: userRecord.id,
                role: userRecord.role,
                email: userRecord.email,
                name: userRecord.name ?? undefined
            };
            const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
            return {
                access_token: await this.jwt.signAsync(payload, { expiresIn }),
            };
        }
        catch (error) {
            const errMsg = (error instanceof Error) ? error.message : String(error);
            this.logger.error(`Error refreshing token: ${errMsg}`);
            throw new common_1.UnauthorizedException('Token refresh failed');
        }
    }
    async changePassword(userId, oldPassword, newPassword) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const ok = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!ok)
            throw new common_1.UnauthorizedException('Old password is incorrect');
        const newHash = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });
        return { message: 'Password changed successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map