import { Response } from 'express';

const IS_PROD = process.env.NODE_ENV === 'production';

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 min
    });
    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: 'strict',
        // path: '/auth/refresh', // scoped — only sent to refresh endpoint
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
}

export function clearAuthCookies(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
}
