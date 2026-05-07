/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class RefreshGuard implements CanActivate {
    constructor(
        private jwt: JwtService,
        private config: ConfigService
    ) {}

    canActivate(ctx: ExecutionContext): boolean {
        const req = ctx.switchToHttp().getRequest<Request>();
        const token = req?.cookies?.refresh_token;
        if (!token) throw new UnauthorizedException('No refresh token');

        try {
            req['user'] = this.jwt.verify(token, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
            });
            req['refreshToken'] = token;
            return true;
        } catch {
            throw new UnauthorizedException('Refresh token invalid or expired');
        }
    }
}
