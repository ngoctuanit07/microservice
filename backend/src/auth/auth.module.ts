import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { TwoFAService } from './twofa.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    CommonModule,
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          console.warn('WARNING: JWT_SECRET not set in environment variables. Using default secret which is insecure!');
        }
        
        return {
          secret: secret || 'default-secret-not-for-production-use',
          signOptions: { 
            expiresIn: process.env.JWT_EXPIRES_IN || '1h',
          },
        };
      },
    }),
  ],
  providers: [AuthService, JwtStrategy, TwoFAService],
  controllers: [AuthController],
  exports: [TwoFAService, AuthService],
})
export class AuthModule {}
