// backend/src/auth/auth.controller.ts
import { Body, Controller, Post, Req, UseGuards, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TwoFAService } from './twofa.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    @Inject(TwoFAService) private twofa: TwoFAService,
  ) {}
  @Post('send-otp')
  async sendOtp(@Body('email') email: string) {
    return this.twofa.sendOtp(email);
  }

  @Post('verify-otp')
  async verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
    return this.twofa.verifyOtp(email, otp);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(@Body() dto: ChangePasswordDto, @Req() req: any) {
    const userId = req.user?.sub;
    return this.auth.changePassword(userId, dto.oldPassword, dto.newPassword);
  }
}
