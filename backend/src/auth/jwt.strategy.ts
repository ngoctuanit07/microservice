import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  role: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor() {
    const jwtSecret = process.env.JWT_SECRET;
    const defaultSecret = 'default-secret-do-not-use-in-production';
    
    super({
      secretOrKey: jwtSecret || defaultSecret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
    });
    
    if (!jwtSecret) {
      this.logger.warn('JWT_SECRET not set, using default secret. This is not secure for production!');
    }
  }
  
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Validate payload has required fields
    if (!payload.sub || !payload.email) {
      this.logger.warn(`Invalid JWT payload detected: ${JSON.stringify(payload)}`);
      throw new UnauthorizedException('Invalid token');
    }
    
    // attach to request.user
    return {
      sub: payload.sub,
      role: payload.role,
      email: payload.email
    };
  }
}
