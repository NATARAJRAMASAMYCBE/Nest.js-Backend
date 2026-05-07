import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private jwt: JwtService,
        private config: ConfigService,
        private reflector: Reflector // <-- inject Reflector
    ) {}

    canActivate(ctx: ExecutionContext): boolean {
        // Check if the route is marked @Public()
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [ctx.getHandler(), ctx.getClass()]);
        if (isPublic) return true;

        const req = ctx.switchToHttp().getRequest<Request>();
        const token = req.cookies?.access_token;
        if (!token) throw new UnauthorizedException('No access token');

        try {
            req['user'] = this.jwt.verify(token, {
                secret: this.config.get('JWT_ACCESS_SECRET'),
            });
            return true;
        } catch {
            throw new UnauthorizedException('Token invalid or expired');
        }
    }
}
