// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

interface TokenPayload {
  sub: number;
  roleId: number;
  roleName: string;
  email: string;
  name?: string | null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  constructor(
    private prisma: PrismaService, 
    private jwt: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({ 
        where: { email },
        include: { role: true }
      });
      if (!user) {
        this.logger.warn(`Login attempt with non-existent email: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        this.logger.warn(`Failed login attempt for user: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }
      this.logger.log(`User ${email} logged in successfully`);
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const errMsg = (error instanceof Error) ? error.message : String(error);
      this.logger.error(`Error validating user: ${errMsg}`);
      throw new UnauthorizedException('Authentication error');
    }
  }

  async login(email: string, password: string) {
    const user: any = await this.validateUser(email, password);
    
    // Extract role information safely
    const roleId = user.roleId || 0;
    const roleName = user.role && user.role.name ? user.role.name : 'user';
    
    const payload: TokenPayload = { 
      sub: user.id, 
      roleId,
      roleName,
      email: user.email,
      name: user.name ?? undefined
    };
    
    // Get token expiration time from env or use default (1 hour)
    const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
    
    return { 
      access_token: await this.jwt.signAsync(payload, { expiresIn }),
      user: {
        id: user.id,
        email: user.email,
        roleId,
        roleName,
        name: user.name ?? undefined
      }
    };
  }
  
  async refreshToken(user: TokenPayload) {
    try {
      // Verify user still exists and is active
      const userRecord: any = await this.prisma.user.findUnique({ 
        where: { id: user.sub }
      });
      
      if (!userRecord) {
        throw new UnauthorizedException('User no longer exists');
      }
      
      // Create a new payload with fresh data - use existing role info from token
      // This avoids having to join the role table again
      const payload: TokenPayload = { 
        sub: userRecord.id,
        roleId: user.roleId,
        roleName: user.roleName,
        email: userRecord.email,
        name: userRecord.name ?? undefined
      };
      
      // Get token expiration time from env or use default (1 hour)
      const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
      
      return { 
        access_token: await this.jwt.signAsync(payload, { expiresIn }),
      };
    } catch (error) {
      const errMsg = (error instanceof Error) ? error.message : String(error);
      this.logger.error(`Error refreshing token: ${errMsg}`);
      throw new UnauthorizedException('Token refresh failed');
    }
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    const ok = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Old password is incorrect');
    const newHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });
    return { message: 'Password changed successfully' };
  }
}
