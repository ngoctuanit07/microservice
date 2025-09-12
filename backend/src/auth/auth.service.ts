// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

interface TokenPayload {
  sub: number;
  role: string;
  email: string;
  name?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  constructor(
    private prisma: PrismaService, 
    private jwt: JwtService
  ) {}

  async validateUser(email: string, password: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
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
      this.logger.error(`Error validating user: ${error.message}`);
      throw new UnauthorizedException('Authentication error');
    }
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload: TokenPayload = { 
      sub: user.id, 
      role: user.role, 
      email: user.email,
      name: user.name
    };
    
    // Get token expiration time from env or use default (1 hour)
    const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
    
    return { 
      access_token: await this.jwt.signAsync(payload, { expiresIn }),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    };
  }
  
  async refreshToken(user: TokenPayload) {
    try {
      // Verify user still exists and is active
      const userRecord = await this.prisma.user.findUnique({ 
        where: { id: user.sub }
      });
      
      if (!userRecord) {
        throw new UnauthorizedException('User no longer exists');
      }
      
      // Create a new payload with fresh data
      const payload: TokenPayload = { 
        sub: userRecord.id, 
        role: userRecord.role, 
        email: userRecord.email,
        name: userRecord.name
      };
      
      // Get token expiration time from env or use default (1 hour)
      const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
      
      return { 
        access_token: await this.jwt.signAsync(payload, { expiresIn }),
      };
    } catch (error) {
      this.logger.error(`Error refreshing token: ${error.message}`);
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
