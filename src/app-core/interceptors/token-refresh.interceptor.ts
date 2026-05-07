// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import { CallHandler, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException } from '@nestjs/common';
// import type { Request, Response } from 'express';
// import { Observable, catchError } from 'rxjs';
// import { AuthService } from 'src/auth/auth.service';
// import { clearAuthCookies, setAuthCookies } from 'src/auth/cookie.helper';

// @Injectable()
// export class TokenRefreshInterceptor implements NestInterceptor {
//     constructor(private auth: AuthService) {}

//     intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
//         const req = ctx.switchToHttp().getRequest<Request>();
//         const res = ctx.switchToHttp().getResponse<Response>();

//         return next.handle().pipe(
//             catchError(async (err) => {
//                 // Only handle 401s — re-throw everything else

//                 console.log('🔴 interceptor caught error:', err?.status, err?.message);
//                 console.log('🍪 cookies:', req.cookies);

//                 if (!(err instanceof UnauthorizedException)) throw err;

//                 const refreshToken = req.cookies?.refresh_token;
//                 const userId = (req as any).user?.sub;

//                 // No refresh token available → force re-login
//                 if (!refreshToken || !userId) {
//                     console.log('❌ missing cookies — clearing and throwing');
//                     clearAuthCookies(res);
//                     throw new UnauthorizedException('Session expired, please log in again');
//                 }

//                 try {
//                     // Attempt silent refresh
//                     const tokens = await this.auth.refresh(userId, refreshToken);
//                     setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

//                     // Re-attach new user payload so the retried handler sees it
//                     req['user'] = { sub: userId };

//                     // Re-run the original route handler
//                     return await next.handle().toPromise();
//                 } catch {
//                     clearAuthCookies(res);
//                     throw new UnauthorizedException('Session expired, please log in again');
//                 }
//             })
//         );
//     }
// }

// import { CallHandler, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import type { Request, Response } from 'express';
// import { Observable, catchError, from, switchMap, throwError } from 'rxjs';
// import { AuthService } from 'src/auth/auth.service';
// import { clearAuthCookies, setAuthCookies } from 'src/auth/cookie.helper';
// import { JwtPayload } from '../interfaces/jwt-payload.interface';

// @Injectable()
// export class TokenRefreshInterceptor implements NestInterceptor {
//     constructor(
//         private auth: AuthService,
//         private jwt: JwtService
//     ) {}

//     intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
//         const req = ctx.switchToHttp().getRequest<Request>();
//         const res = ctx.switchToHttp().getResponse<Response>();

//         return next.handle().pipe(
//             catchError((err) => {
//                 console.log('🔴 interceptor caught:', err?.status, err?.message);
//                 console.log('🍪 cookies:', req.cookies);

//                 if (!(err instanceof UnauthorizedException)) {
//                     return throwError(() => err);
//                 }

//                 const refreshToken = req.cookies?.refresh_token;
//                 const accessToken = req.cookies?.access_token;

//                 console.log('🔑 accessToken present:', !!accessToken);
//                 console.log('🔑 refreshToken present:', !!refreshToken);

//                 if (!refreshToken || !accessToken) {
//                     clearAuthCookies(res);
//                     return throwError(() => new UnauthorizedException('Session expired'));
//                 }

//                 const payload = this.jwt.decode<JwtPayload>(accessToken, { ignoreExpiration: true });
//                 const userId = payload?.sub;

//                 console.log('📦 decoded payload:', payload);

//                 if (!userId) {
//                     clearAuthCookies(res);
//                     return throwError(() => new UnauthorizedException('Session expired'));
//                 }

//                 console.log('🔄 attempting refresh for userId:', userId);

//                 return from(this.auth.refresh(userId, refreshToken)).pipe(
//                     switchMap((tokens) => {
//                         console.log('✅ refresh success, retrying request');
//                         setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
//                         req.user = { sub: userId, email: payload.email };
//                         return next.handle();
//                     }),
//                     catchError((refreshErr) => {
//                         console.log('❌ refresh failed:', refreshErr?.message);
//                         clearAuthCookies(res);
//                         return throwError(() => new UnauthorizedException('Session expired'));
//                     })
//                 );
//             })
//         );
//     }
// }

import { CallHandler, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import { Observable, catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';
import { clearAuthCookies, setAuthCookies } from 'src/auth/cookie.helper';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class TokenRefreshInterceptor implements NestInterceptor {
    constructor(
        private auth: AuthService,
        private jwt: JwtService,
        private reflector: Reflector
    ) {}

    intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
        const req = ctx.switchToHttp().getRequest<Request>();
        const res = ctx.switchToHttp().getResponse<Response>();

        // ✅ Skip interceptor for specific routes (login, register, etc.)
        const skip = this.reflector.get<boolean>('skipTokenRefresh', ctx.getHandler());

        if (skip) {
            return next.handle();
        }

        return next.handle().pipe(
            catchError((err) => {
                console.log('🔴 interceptor caught:', err?.status, err?.message);

                // ✅ Only handle UnauthorizedException
                if (!(err instanceof UnauthorizedException)) {
                    return throwError(() => err);
                }

                const refreshToken = req.cookies?.refresh_token;
                const accessToken = req.cookies?.access_token;

                console.log('🍪 cookies:', req.cookies);

                // ✅ If no tokens → don't override original error
                if (!refreshToken || !accessToken) {
                    return throwError(() => err);
                }

                let payload: JwtPayload | null = null;

                try {
                    // ✅ Verify but ignore expiration
                    payload = this.jwt.verify<JwtPayload>(accessToken, {
                        ignoreExpiration: true,
                    });
                } catch {
                    clearAuthCookies(res);
                    return throwError(() => new UnauthorizedException('Session expired'));
                }

                const userId = payload?.sub;

                if (!userId) {
                    clearAuthCookies(res);
                    return throwError(() => new UnauthorizedException('Session expired'));
                }

                console.log('🔄 attempting refresh for userId:', userId);

                return from(this.auth.refresh(userId, refreshToken)).pipe(
                    switchMap((tokens) => {
                        console.log('✅ refresh success, retrying request');

                        setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

                        // attach user again
                        req.user = {
                            sub: userId,
                            email: payload?.email,
                        };

                        return next.handle();
                    }),
                    catchError((refreshErr) => {
                        console.log('❌ refresh failed:', refreshErr?.message);

                        clearAuthCookies(res);

                        return throwError(() => new UnauthorizedException('Session expired'));
                    })
                );
            })
        );
    }
}
