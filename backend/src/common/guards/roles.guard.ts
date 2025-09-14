import { CanActivate, ExecutionContext, Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true;
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { role?: string };
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }
    if (!user.role) {
      throw new ForbiddenException('User has no role');
    }
    if (!required.includes(user.role)) {
      throw new ForbiddenException('User does not have required role');
    }
    return true;
  }
}
